$(document).ready(async function () {
    var gender = getGenderFromQueryString();
    var quizSections = await readQuizSectionsJson("Configs/QuizSections.json");
    var fullHtml = generateQuizHtml(quizSections, gender);
    $('#_quizContent').html(fullHtml);
    enableAllTooltips();
});

/*
 Rips the gender from the query string.
 */
function getGenderFromQueryString() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
      });
      return params.gender;
}

/*
 Let's the user continue to the next section.
 */
function nextSection() {
    let visible = $('.quizSection:visible').first(); 

    if (visible) {
        visible.toggle();

        let next = visible.next('.quizSection');
        if (next) {
            next.toggle();
        }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/*
 Let's the user go back to the previous section.
 */
function previousSection() {
    let visible = $('.quizSection:visible').first(); 

    if (visible) {
        visible.toggle();

        let next = visible.prev('.quizSection');
        if (next) {
            next.toggle();
        }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/*
 Finish quiz and generate URL.
 */
function finishQuiz() {
    var selectedRadios = [];
    $('input[type="radio"]:checked').each(function() {
        selectedRadios.push($(this).val());
    });
    var gender = getGenderFromQueryString();
    var base64String = packArrayToBase64(selectedRadios, gender == "female")
    var queryString = `data=${sanitizeBase64ToQueryString(base64String)}`;

    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    const baseUrl = `${window.location.origin}${basePath}`;

    window.location.href = new URL(`personalResults.html?${queryString}`, baseUrl).href;
}