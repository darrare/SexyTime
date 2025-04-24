/*
  Reads the JSON file and returns the JSON object.
 */
async function readQuizSectionsJson(path) {
    const response = await fetch(path);
    if (!response.ok) {
    throw new Error(`HTTP error when loading ${path}: ${response.status}`);
    }
    return await response.json();
}

/*
  Generates the entirety of all quiz questions in HTML format easy to add to the html page.
 */
function generateQuizHtml(quizSections, gender) {
    var content = [];
    for (let i = 0; i < quizSections.sections.length; i++) {
        content.push(generateQuizHtmlSection(quizSections.sections[i], gender, i, quizSections.sections.length));
    }
    return content.join("");
}

/*
  Generates an individual quiz section.
 */
function generateQuizHtmlSection(quizSection, gender, currentIndex, maxIndex) {
    var content = [];
    content.push(`<div id="${quizSection.id}"${currentIndex != 0 ? "hidden" : ""}>`);
    content.push(generateQuizSectionHeader(quizSection));
    content.push(generateQuizSectionQuestions(quizSection, gender, currentIndex, maxIndex));
    content.push(`</div>`);
    return content.join("");
}

/*
  Generates the quiz section header.
 */
function generateQuizSectionHeader(quizSection) {
    var content = [];
    content.push(`<div class="px-4 py-5 bg-primary" style="--bs-bg-opacity: .3">`);
    content.push(`    <div class="text-center container-lg mt-4">`);
    content.push(`        <h1>${quizSection.title}</h1>`);
    content.push(`        <h6>${quizSection.slogan}</h6>`);
    content.push(`    </div>`);
    content.push(`</div>`);
    return content.join("");
}

/*
  Generates the quiz section questions.
 */
function generateQuizSectionQuestions(quizSection, gender, currentIndex, maxIndex) {
    var content = [];

    content.push(`<div class="container-lg mt-4">`);
    content.push(`    <p>${quizSection.description}</p>`);
    content.push(`    <div class="d-flex justify-content-between align-items-end mb-2">`);
    content.push(`        <h2 class="m-0">Questions (${quizSection.questions.length})</h2>`);
    content.push(`        <div>`);
    content.push(`            <a class="btn btn-info" href="" data-bs-toggle="modal" data-bs-target="#instructions">Instructions</a>`);
    content.push(`        </div>`);
    content.push(`    </div>`);
    content.push(`    <div class="progress">`);
    content.push(`        <div class="progress-bar progress-bar-striped bg-info progress-bar-animated" role="progressbar" style="width: ${(currentIndex + 1) / maxIndex * 100}%">${currentIndex + 1} of ${maxIndex}</div>`);
    content.push(`    </div>`);
    content.push(`    <ul class="list-group list-group-flush">`);

    for (let i = 0; i < quizSection.questions.length; i++) {
        content.push(generateQuizSectionQuestion(quizSection.questions[i], gender));
    }

    content.push(`    </ul>`);
    content.push(`    <div class="progress">`);
    content.push(`        <div class="progress-bar progress-bar-striped bg-info progress-bar-animated" role="progressbar" style="width: ${(currentIndex + 1) / maxIndex * 100}%">${currentIndex + 1} of ${maxIndex}</div>`);
    content.push(`    </div>`);
    content.push(`    <div class="row mt-4" id="bottom">`);

    if (currentIndex != 0) {
        content.push(`        <div class="col-md-auto col-4">`);
        content.push(`            <a class="btn btn-primary btn-lg w-100" href="1"><i class="fa-solid fa-caret-left"></i> Back</a>`);
        content.push(`        </div>`);
    }

    if (currentIndex != maxIndex - 1) {
        content.push(`        <div class="col-md-auto col" id="bottom">`);
        content.push(`            <button class="btn btn-success btn-lg w-100" type="submit" onclick="window.onbeforeunload = null; return true;">Continue <i class="fa-solid fa-caret-right"></i></button>`);
        content.push(`        </div>`);
    } else {
        content.push(`        <div class="col-md-auto col" id="bottom">`);
        content.push(`            <button class="btn btn-success btn-lg w-100" type="submit" onclick="event.preventDefault();" data-bs-toggle="modal" data-bs-target="#finish_modal">Finish Quiz <i class="fa-solid fa-share"></i></button>`);
        content.push(`        </div>`);
    }

    content.push(`    </div>`);
    content.push(`</div>`);

    return content.join("");
}

/*
  Generates a single quiz section question.
 */
function generateQuizSectionQuestion(quizSectionQuestion, gender) {
    var content = [];

    content.push(`        <li class="list-group-item px-md-3 px-0">`);
    content.push(`            <div class="row">`);
    content.push(`                <div class="col-md pt-md-2">`);
    content.push(`                    ${gender === "female" ? quizSectionQuestion.promptSheSees : quizSectionQuestion.promptHeSees}`);
    if (quizSectionQuestion.helpPrompt != "") {
        content.push(`                    <span class="text-primary" role="button" data-bs-toggle="tooltip" aria-label="${quizSectionQuestion.helpPrompt}" data-bs-original-title="${quizSectionQuestion.helpPrompt}"><i class="fa-solid fa-circle-question"></i></span>`);
    }
    content.push(`                </div>`);
    content.push(`                <div class="col-md">`);
    content.push(`                    <div class="row gx-1">`);
    content.push(`                        <div class="col">`);
    content.push(`                            <input class="btn-check" type="radio" id="${quizSectionQuestion.id}_1" name="answers[${quizSectionQuestion.id}]" value="1">`);
    content.push(`                            <label title="No means no" class="btn btn-outline-primary btn-lg w-100 fs-6" data-bs-toggle="tooltip" for="${quizSectionQuestion.id}_1">🤮</label>`);
    content.push(`                        </div>`);
    content.push(`                        <div class="col">`);
    content.push(`                            <input class="btn-check" type="radio" id="${quizSectionQuestion.id}_2" name="answers[${quizSectionQuestion.id}]" value="2">`);
    content.push(`                            <label title="Probably not" class="btn btn-outline-primary btn-lg w-100 fs-6" data-bs-toggle="tooltip" for="${quizSectionQuestion.id}_2">😕</label>`);
    content.push(`                        </div>`);
    content.push(`                        <div class="col">`);
    content.push(`                            <input class="btn-check" type="radio" id="${quizSectionQuestion.id}_3" name="answers[${quizSectionQuestion.id}]" value="3">`);
    content.push(`                            <label title="If my partner wants to" class="btn btn-outline-primary btn-lg w-100 fs-6" data-bs-toggle="tooltip" for="${quizSectionQuestion.id}_3">🤷</label>`);
    content.push(`                        </div>`);
    content.push(`                        <div class="col">`);
    content.push(`                            <input class="btn-check" type="radio" id="${quizSectionQuestion.id}_4" name="answers[${quizSectionQuestion.id}]" value="4">`);
    content.push(`                            <label title="Yeah!" class="btn btn-outline-primary btn-lg w-100 fs-6" data-bs-toggle="tooltip" for="${quizSectionQuestion.id}_4">😀</label>`);
    content.push(`                        </div>`);
    content.push(`                        <div class="col">`);
    content.push(`                            <input class="btn-check" type="radio" id="${quizSectionQuestion.id}_5" name="answers[${quizSectionQuestion.id}]" value="5">`);
    content.push(`                            <label title="Fuck yeah!" class="btn btn-outline-primary btn-lg w-100 fs-6" data-bs-toggle="tooltip" for="${quizSectionQuestion.id}_5">😍</label>`);
    content.push(`                        </div>`);
    content.push(`                    </div>`);
    content.push(`                </div>`);
    content.push(`            </div>`);
    content.push(`        </li>`);

    return content.join("");
}