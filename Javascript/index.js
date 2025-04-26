$(document).ready(async function () {
    var quizSectionsJson = await readQuizSectionsJson("Configs/QuizSections.json");
    enableAllTooltips();
    populateQuestionsCount(getQuestionIdsMapped(quizSectionsJson).length);
});

/*
 Gets the number of questions that will be answered during the quiz.
 */
function populateQuestionsCount(value) {
    $('#_question-count').html(`${value} Questions`);
}

/*
 The Start Quiz button was clicked.
 */
function onStartQuizClick() {
    // Validate that one of the anatomy options are selected
    var gender = $('input[name="anatomy"]:checked').val();
    if (!gender) {
        showNotice("An anatomy option must be selected to continue...");
        return;
    }

    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    const baseUrl = `${window.location.origin}${basePath}`;

    if (gender === "male" || gender === "female") {
        window.location.href = new URL(`quiz.html?gender=${gender}`, baseUrl).href;
    } else {
        showNotice("Somehow an invalid gender got through. Please reload the page.");
    }
}