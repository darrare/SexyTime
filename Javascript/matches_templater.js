/*********************************************************
THIS IS ALL FOR MATCHES
**********************************************************/
const matchIdLowestValueToDictateMatch = 2;
function generateMatchesHtml(usableDataJson, gender) {
    var content = [];
    for (let i = 0; i < usableDataJson.sections.length; i++) {
        if (usableDataJson.sections[i].isMatchable == "true") {
            content.push(generateSectionHtml(usableDataJson.sections[i], gender));
        }
    }
    return content.join("");
}

function generateSectionHtml(usableDataSection, gender) {
    var content = [];
    content.push(`<div class="accordion-item">`);
    content.push(generateSectionHeaderHtml(usableDataSection));
    content.push(generateQuestionsHtml(usableDataSection, gender));
    content.push(`</div>`);
    return content.join("");
}

function generateSectionHeaderHtml(usableDataSection) {
    var content = [];
    var numMatches = usableDataSection.questions.filter(q => parseInt(q.matchId) >= matchIdLowestValueToDictateMatch).length;
    content.push(`<h2 class="accordion-header" id="flush-heading1-${usableDataSection.id}">`);
    content.push(`    <button class="accordion-button open collapsed" type="button" data-bs-toggle="collapse"`);
    content.push(`        data-bs-target="#flush-collapse-${usableDataSection.id}" aria-expanded="false" aria-controls="flush-collapse-${usableDataSection.id}">`);
    content.push(`        <span class="h3">${usableDataSection.title} <i><span style="font-size:1rem;">(${numMatches} matches) </span></i></span>`);
    content.push(`    </button>`);
    content.push(`</h2>`);
    return content.join("");
}

function generateQuestionsHtml(usableDataSection, gender) {
    var content = [];
    content.push(`<div id="flush-collapse-${usableDataSection.id}" class="accordion-collapse collapse" aria-labelledby="flush-heading-${usableDataSection.id}">`);
    content.push(`    <div class="accordion-body p-0">`);
    content.push(`        <ul class="list-group list-group-flush">`);
    for (let i = 0; i < usableDataSection.questions.length; i++) {
        if (usableDataSection.questions[i].matchId >= matchIdLowestValueToDictateMatch) {
            content.push(generateQuestionHtml(usableDataSection.questions[i], gender));
        }
    }
    content.push(`        </ul>`);
    content.push(`    </div>`);
    content.push(`</div>`);
    return content.join("");
}

function generateQuestionHtml(usableDataQuestion, gender) {
    var content = [];
    content.push(`<li class="list-group-item">`);
    content.push(`    <p><b>Question:</b> ${generateQuestionString(usableDataQuestion, gender)}</p>`);
    content.push(`    <div class="row">`);
    content.push(`        <p class="col-6 mb-0"><b>You: </b>${matchIdMap(usableDataQuestion.yourVote)}</p>`);
    content.push(`        <p class="col-6 mb-0"><b>Them </b>${matchIdMap(usableDataQuestion.theirVote)}</p>`);
    content.push(`    </div>`);
    content.push(`</li>`);
    return content.join("");
}

function generateQuestionString(usableDataQuestion, gender) {
    if (usableDataQuestion.promptHeSees == usableDataQuestion.promptSheSees) {
        return usableDataQuestion.promptHeSees;
    }
    else if (gender == "female") {
        return `${usableDataQuestion.promptSheSees} / ${usableDataQuestion.promptHeSees}`;
    } else {
        return `${usableDataQuestion.promptHeSees} / ${usableDataQuestion.promptSheSees}`;
    }
}

/*********************************************************
THIS IS ALL FOR NON MATCHABLE SECTIONS
**********************************************************/
function generateNonMatchableSections(usableDataJson, gender) {
    var content = [];
    content.push(generateBodyImageHtml(usableDataJson.sections.find(t => t.id === "_quizSectionBodyPreferences"), gender));
    return content.join("");
}

function generateBodyImageHtml(usableDataSection, gender) {
    var content = [];
    content.push(generateBodyImageHeaderHtml(usableDataSection));
    content.push(generateBodyImageBodyHtml(usableDataSection, gender));

    return content.join("");
}

function generateBodyImageHeaderHtml(usableDataSection) {
    var content = [];
    content.push(`<div class="container">`);
    content.push(`    <div class="row">`);
    content.push(`        <h2 id="preferences" class="mt-5 mb-3 d-flex justify-content-center">${usableDataSection.title}</h2>`);
    content.push(`        <p class="d-flex justify-content-center">${usableDataSection.detailedDescription}</p>`);
    content.push(`    </div>`);
    content.push(`</div>`);
    return content.join("");
}

function generateBodyImageBodyHtml(usableDataSection, gender) {
    var content = [];
    content.push(`<div class="container-lg">`);
    content.push(`  <div class="row">`);
    content.push(`      <div class="col-6">`);
    content.push(`          <h3 class="d-flex justify-content-center">Your Answers</h3>`);
    content.push(`      </div>`);
    content.push(`      <div class="col-6">`);
    content.push(`          <h3 class="d-flex justify-content-center">Their Answers</h3>`);
    content.push(`      </div>`);
    content.push(`  </div>`);
    for (let i = 0; i < usableDataSection.questions.length; i++) {
        content.push(generateBodyImageQuestionHtml(usableDataSection.questions[i], gender));
    }

    content.push(`</div>`);

    return content.join("");
}

function generateBodyImageQuestionHtml(usableDataQuestion, gender) {
    var content = [];
    var partnerGender = gender == "female" ? "male" : "female";
    content.push(`<div class="row">`)
    content.push(`    <div class="col-6">`);
    content.push(`        <p><b>Question:</b> ${generateBodyImageQuestionString(usableDataQuestion, gender)}</p>`);
    content.push(`        <p class="d-flex justify-content-center">${matchIdMap(usableDataQuestion.yourVote)}</p>`);
    content.push(`    </div>`);
    content.push(`    <div class="col-6">`);
    content.push(`        <p><b>Question:</b> ${generateBodyImageQuestionString(usableDataQuestion, partnerGender)}</p>`);
    content.push(`        <p class="d-flex justify-content-center">${matchIdMap(usableDataQuestion.theirVote)}</p>`);
    content.push(`    </div>`);
    content.push(`</div>`);
    return content.join("");
}

function generateBodyImageQuestionString(usableDataQuestion, gender) {
    if (gender == "female") {
        return `${usableDataQuestion.promptSheSees}`;
    } else {
        return `${usableDataQuestion.promptHeSees}`;
    }
}


/*********************************************************
THIS IS ALL COMMON STUFF
**********************************************************/

function matchIdMap(matchId) {
    switch (matchId) {
        case 0:
            return "🤮";
        case 1:
            return "😕";
        case 2:
            return "🤷";
        case 3:
            return "😀";
        case 4:
            return "😍";
        default:
            throw "Match ID not mappable."
    }
}