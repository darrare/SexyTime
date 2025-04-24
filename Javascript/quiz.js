$(document).ready(async function () {
    var gender = getGenderFromQueryString();
    var quizSections = await readQuizSectionsJson("Configs/QuizSections.json");
    var fullHtml = generateQuizHtml(quizSections, gender);
    //alert(fullHtml);
    $('#_quizContent').html(fullHtml);
    enableAllTooltips();
});

function getGenderFromQueryString() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
      });
      return params.gender;
}

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
 Let's the user continue to the next section.
 */
function nextSection() {

}

/*
 Let's the user go back to the previous section.
 */
function previousSection() {

}

/*
 Finish quiz and generate URL.
 */
 function finishQuiz() {

 }