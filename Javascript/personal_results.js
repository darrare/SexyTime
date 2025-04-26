var originalDataArray;
var quizSectionsJson;
$(document).ready(async function () {
    originalDataArray = readQueryStringDataAndGetResult(window.location.href, "data").dataArray;
    quizSectionsJson = await readQuizSectionsJson("Configs/QuizSections.json");
    var usefulData = buildUsefulDataCollectionFromResults(originalDataArray, quizSectionsJson);
    drawFreakScoreGraph(getFreakScoreGraphData(usefulData));
    drawPreferencesGraph(getPreferencesGraphData(usefulData));
    initializeStaticUrlInput($("#_personalResultUrl"));
    enableAllTooltips();
});

/*
Reads from the json to get the data useful for drawing the freak score graph.
*/
function getFreakScoreGraphData(usefulData) {
    var voteValues = usefulData.sections.flatMap(section => 
        section.questions.map(question => question.voteValue)
    );
    return (voteValues.reduce((sum, voteValue) => sum + voteValue, 0) / voteValues.length / 4 * 100).toFixed(2);
}

/*
Reads from the json to get the data useful for drawing the preferences graph.
*/
function getPreferencesGraphData(usefulData) {
    var labels = usefulData.sections.flatMap(section => section.title);
    var data = [];
    usefulData.sections.forEach(section => {
        const questionValues = section.questions.map(q => parseInt(q.voteValue));
        const averageId = questionValues.reduce((sum, voteValue) => sum + voteValue, 0) / questionValues.length;
        data.push(averageId);
      });
    return { labels: labels,  data: data };
}

/*
Takes the query string data and the quiz sections json to create a usable map.
*/
function buildUsefulDataCollectionFromResults(originalDataArray, quizSectionsJson) {
    var questionIds = getQuestionIdsMapped(quizSectionsJson);
    if (originalDataArray.length != questionIds.length) {
        throw "Query string invalid";
    }
  
    var index = 0;
    quizSectionsJson.sections.forEach(section => {
        section.questions.forEach(question => {
            question.voteValue = originalDataArray[index];
            index++;
        });
    });
    return quizSectionsJson;
  }

/*
Calculate the couples results and redirects to that page.
*/
function validateEntryAndRedirectToCouplesResultsPage() {
    try {
        if (!isValidUrl($("#_partnersResultUrl").val())) { throw "Partner's URL is invalid.";}

        var partnersDataArray = readQueryStringDataAndGetResult($("#_partnersResultUrl").val(), "data").dataArray;
    
        //validate
        if (originalDataArray.length != partnersDataArray.length) {
            throw "Your URL and your parnter's URL contain data of different lengths. " +
                "This is likely due to the URL being generated on different versions of the app " +
                "or a mistake when copying or pasting your partner's URL."
        }

        computeQueryStringAndRedirect($("#_personalResultUrl").val(), $("#_partnersResultUrl").val());
    } catch (error) {
        showNotice(error);
    }
}

/*
Get the appropriate query string for the couples responses
*/
function computeQueryStringAndRedirect(yourUrl, partnersUrl)
{
    const params = new URLSearchParams({
        y: new URL(yourUrl).searchParams.get('data'),
        t: new URL(partnersUrl).searchParams.get('data')
    });

    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    const baseUrl = `${window.location.origin}${basePath}`;

    window.location.href = new URL(`couplesResults.html?${params.toString()}`, baseUrl).href;
}

/*
Check to see if a URL is valid
*/
function isValidUrl(string) {
    try {
        new URL(string);
        return true; // The URL is valid
    } catch (e) {
        return false; // Invalid URL
    }
}