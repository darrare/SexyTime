var usefulData;
$(document).ready(async function () {
  var yourData = readQueryStringDataAndGetResult(window.location.href, "y");
  var yourDataArray = yourData.dataArray;
  var gender = yourData.isFemale ? "female" : "male";
  $('#_genderY').html(yourData.isFemale ? "She" : "He");
  var theirData = readQueryStringDataAndGetResult(window.location.href, "t");
  $('#_genderT').html(theirData.isFemale ? "She" : "He");
  var theirDataArray = theirData.dataArray;
  var quizSectionsJson = await readQuizSectionsJson("Configs/QuizSections.json");
  usefulData = buildUsefulDataCollectionFromCoupleData(yourDataArray, theirDataArray, quizSectionsJson);
  initializeStaticUrlInput($('#_couplesResultsUrl'));
  drawCoupleFreakScoreGraph(getCoupleFreakScoreGraphData(usefulData));
  drawCouplePreferencesGraph(getCouplePreferencesGraphData(usefulData));
  $('#_coupleResultsAccordion').html(generateMatchesHtml(usefulData, gender));
  $('#_nonMatchableSections').html(generateNonMatchableSections(usefulData, gender));
  enableAllTooltips();

  $('#_playGameLink').attr("href", "./game.html" + window.location.search);

  // TESTING
  //writeUsefulDataToFile(usefulData);
});

/*
TEST: This is used to write the data to a file so I can pump it into ChatGPT
*/
function writeUsefulDataToFile(usefulDataJson) {
  const jsonStr = JSON.stringify(usefulDataJson, null, 2); // Pretty print JSON
  const blob = new Blob([jsonStr], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "usefulData.json";

  // Click the link programmatically
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
