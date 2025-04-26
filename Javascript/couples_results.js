var usefulData;
$(document).ready(async function () {
  var yourData = readQueryStringDataAndGetResult(window.location.href, "y");
  var yourDataArray = yourData.dataArray;
  var gender = yourData.isFemale ? "female" : "male";
  var theirDataArray = readQueryStringDataAndGetResult(window.location.href, "t").dataArray;
  var quizSectionsJson = await readQuizSectionsJson("Configs/QuizSections.json");
  usefulData = buildUsefulDataCollectionFromResults(yourDataArray, theirDataArray, quizSectionsJson);
  initializeStaticUrlInput($('#_couplesResultsUrl'));
  drawCoupleFreakScoreGraph(getCoupleFreakScoreGraphData(usefulData));
  drawCouplePreferencesGraph(getCouplePreferencesGraphData(usefulData));
  var fullHtml = generateMatchesHtml(usefulData, gender);
  $('#_coupleResultsAccordion').html(fullHtml);
  enableAllTooltips();
});

/*
Takes the query string data and the quiz sections json to create a usable map.
*/
function buildUsefulDataCollectionFromResults(yourDataArray, theirDataArray, quizSectionsJson) {
  var questionIds = getQuestionIdsMapped(quizSectionsJson);
  if (yourDataArray.length != theirDataArray.length && yourDataArray.length != questionIds.length) {
    showNotice("Data lengths are inconsistent, likely due to data coming from different versions. Please retake the quiz and try again.")
    return;
  }

  var matchResults = compareResponses(yourDataArray, theirDataArray);

  var index = 0;
  quizSectionsJson.sections.forEach(section => {
    section.questions.forEach(question => {
      question.yourVote = yourDataArray[index];
      question.theirVote = theirDataArray[index];
      question.matchId = matchResults[index];
      index++;
    });
  });
  return quizSectionsJson;
}

/*
Reads from the json to get the data useful for drawing the freak score graph.
*/
function getCoupleFreakScoreGraphData(usefulData) {
  var voteValues = usefulData.sections.flatMap(section =>
    section.questions.map(question => [question.yourVote, question.theirVote])
  );
  return [(voteValues.reduce((sum, voteValue) => sum + voteValue[0], 0) / voteValues.length / 4 * 100).toFixed(2),
    (voteValues.reduce((sum, voteValue) => sum + voteValue[1], 0) / voteValues.length / 4 * 100).toFixed(2)
  ]
}

/*
Reads from the json to get the data useful for drawing the preferences graph.
*/
function getCouplePreferencesGraphData(usefulData) {
  var labels = usefulData.sections.flatMap(section => section.title);
  var yourData = [];
  var theirData = [];
  usefulData.sections.forEach(section => {
    const yourQuestionValues = section.questions.map(q => parseInt(q.yourVote));
    const theirQuestionValues = section.questions.map(q => parseInt(q.theirVote));
    const yourAverageId = yourQuestionValues.reduce((sum, voteValue) => sum + voteValue, 0) / yourQuestionValues.length;
    const theirAverageId = theirQuestionValues.reduce((sum, voteValue) => sum + voteValue, 0) / theirQuestionValues.length;
    yourData.push(yourAverageId);
    theirData.push(theirAverageId);
  });
  return { labels: labels, data: [yourData, theirData] };
}

/*
Compares the users and their partners arrays to find a map of matches.
*/
function compareResponses(arr1, arr2) {
  const results = [];

  for (let i = 0; i < arr1.length; i++) {
    const a = arr1[i];
    const b = arr2[i];

    // Never = 0
    // Probably Not = 1
    // Neutral = 2
    // Match = 3
    // Super Match = 4

    if (a === 0 || b === 0 || (a === 1 && b === 1)) {
      results.push(0);
    } else if (a === 4 && b === 4) {
      results.push(4);
    } else if (
      (a === 4 && b === 3) || (a === 3 && b === 4) ||
      (a === 3 && b === 3) || (a === 2 && b === 4) ||
      (a === 4 && b === 2) || (a === 2 && b === 3) ||
      (a === 3 && b === 2)
    ) {
      results.push(3);
    } else if (a === 2 && b === 2) {
      results.push(2);
    } else if (
      (a === 1 && b === 2) || (a === 2 && b === 1) ||
      (a === 1 && b === 3) || (a === 3 && b === 1) ||
      (a === 1 && b === 4) || (a === 4 && b === 1)
    ) {
      results.push(1);
    } else {
      throw `Somehow an unmapped result got through: a: ${a}, b: ${b}`
    }
  }

  return results;
}

/*
NOT USED - This was implemented as it stores more relevant data, but
it would cause a HUGE increase to the query string so I decided to go another route.
Compares the users and their partners arrays to find a map of matches.
*/
function compareResponsesOLD(arr1, arr2, questionIdsArray) {
  const groupedResults = {};

  for (let i = 0; i < arr1.length; i++) {
    const a = arr1[i];
    const b = arr2[i];

    let mappedResult = '';

    if (a === 0 || b === 0 || (a === 1 && b === 1)) {
      mappedResult = 'Never';
    } else if (a === 4 && b === 4) {
      mappedResult = 'Super Match';
    } else if (
      (a === 4 && b === 3) || (a === 3 && b === 4) ||
      (a === 3 && b === 3) || (a === 2 && b === 4) ||
      (a === 4 && b === 2) || (a === 2 && b === 3) ||
      (a === 3 && b === 2)
    ) {
      mappedResult = 'Match';
    } else if (a === 2 && b === 2) {
      mappedResult = 'Neutral';
    } else if (
      (a === 1 && b === 2) || (a === 2 && b === 1) ||
      (a === 1 && b === 3) || (a === 3 && b === 1) ||
      (a === 1 && b === 4) || (a === 4 && b === 1)
    ) {
      mappedResult = 'Probably Not';
    } else {
      mappedResult = 'Unmapped';
    }

    if (!groupedResults[mappedResult]) {
      groupedResults[mappedResult] = [];
    }

    groupedResults[mappedResult].push([
      questionIdsArray[i],
      a,
      b
    ]);
  }

  return groupedResults;
}
