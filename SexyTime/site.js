$(document).ready(function () {
    enableAllTooltips();
    populateQuestionsCount();
});

/*
 Due to overhead on tooltips, they are disabled by default.
 The following code will enable all tooltips on the page automatically.
 */
function enableAllTooltips() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })
}

/*
 Gets the number of questions that will be answered during the quiz.
 */
function populateQuestionsCount() {
    // TODO: Pull from the actual data to get the total number of questions.
    $('#_question-count').html("100 Questions");
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

    if (gender === "male") {

    } else if (gender === "female") {

    } else {
        showNotice("Somehow an invalid gender got through. Please reload the page.");
    }
}

/*
 Shows a notice to the user. Will eventually be changed to be cleaner than just alert.
 */
function showNotice(message) {
    alert(message);
}