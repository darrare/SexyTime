$(document).ready(async function () {
    var originalDataArray = readPersonalResultsQueryString();
    var quizSectionsJson = await readQuizSectionsJson("Configs/QuizSections.json");
    var usefulData = buildUsefulDataCollectionFromResults(originalDataArray, quizSectionsJson);
    var fullHtml = "";
    //$('#_personalResults').html(fullHtml);
    drawFreakScoreGraph(getFreakScoreGraphData(usefulData));
    drawPreferencesGraph(getPreferencesGraphData(usefulData));
    enableAllTooltips();
});

function getFreakScoreGraphData(usefulData) {
    var voteValues = usefulData.sections.flatMap(section => 
        section.questions.map(question => question.voteValue)
    );
    return (voteValues.reduce((sum, voteValue) => sum + voteValue, 0) / voteValues.length / 4 * 100).toFixed(2);
}

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
Due to overhead on tooltips, they are disabled by default.
The following code will enable all tooltips on the page automatically.
*/
function enableAllTooltips() {
   var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
   tooltipTriggerList.map(function (tooltipTriggerEl) {
       return new bootstrap.Tooltip(tooltipTriggerEl)
   })
}

/*
Takes the query string data and the quiz sections json to create a usable map.
*/
function buildUsefulDataCollectionFromResults(originalDataArray, quizSectionsJson) {
    var questionIds = quizSectionsJson.sections.flatMap(section => 
        section.questions.map(question => question.id)
      );
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
Reads the query string and builds an int array that is the answer to all questions
*/
function readPersonalResultsQueryString() {
    var queryParams = new URLSearchParams(window.location.search);
    var queryString = queryParams.get('data');
    var originalBase64String = convertSanitizedQueryStringToBase64(queryString);
    var originalDataArray = decodeBase64ToArray(originalBase64String);
    return originalDataArray;
 }

 /*
Decode a base64 string into an int array.
Specifically in a scenario where the array can only hold values 0-4
*/
function decodeBase64ToArray(base64Str) {
    // Step 1: Decode the Base64 string to a byte array
    const byteString = atob(base64Str);
    const byteArray = Array.from(byteString, char => char.charCodeAt(0));

    // Step 2: Unpack the byte array back into the original array of integers
    let result = [];
    let currentBits = 0;
    let bitCount = 0;

    for (let i = 0; i < byteArray.length; i++) {
        // Add the byte to the current bits accumulator
        currentBits = (currentBits << 8) | byteArray[i];
        bitCount += 8;

        // Extract 3-bit chunks from the current bits
        while (bitCount >= 3) {
            // Extract the 3-bit value
            const value = (currentBits >> (bitCount - 3)) & 0x7; // 0x7 is binary 111

            // If we find a value of 7, it means we should stop because this is our exit condition.
            if (value === 7) { return result;}
            
            result.push(value);

            // Remove the extracted bits
            bitCount -= 3;
        }
    }

    return result;
}

/*
Takes the sanitiezed query string and turns it back into a basic base64 string.
*/
function convertSanitizedQueryStringToBase64(base64url) {
    // Pad with `=` to restore correct length
    const padLength = (4 - (base64url.length % 4)) % 4;
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLength);
    return base64;
}