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
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })
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
}

/*
 Finish quiz and generate URL.
 */
function finishQuiz() {
    var selectedRadios = [];
    $('input[type="radio"]:checked').each(function() {
        selectedRadios.push($(this).val());
    });
    var base64String = packArrayToBase64(selectedRadios)
    var queryString = `data=${sanitizeBase64ToQueryString(base64String)}`;

    window.location.href = new URL(`personalResults.html?${queryString}`, window.location.origin).href;
}

/*
 Encode the int array into a binary string.
 */
function encodeIntArray(arr) {
    const typedArray = new Uint16Array(arr);

    const binary = String.fromCharCode(...new Uint8Array(typedArray.buffer));

    const base64 = btoa(binary);

    // Make it URL-safe (replace +, /, =)
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/*
Pack the array into a base64 string
 */
function packArrayToBase64(arr) {
    let byteArray = [];
    let currentByte = 0;
    let bitCount = 0;

    // Loop through each value in the array
    for (let i = 0; i < arr.length; i++) {
        // Shift the current value into the correct position in the byte
        currentByte = (currentByte << 3) | arr[i];
        bitCount += 3;

        // If we've packed at least 8 bits (a full byte), add it to the byte array
        if (bitCount >= 8) {
            byteArray.push(currentByte >> (bitCount - 8));  // Extract the upper 8 bits
            currentByte &= (1 << (bitCount - 8)) - 1;  // Keep the lower bits for the next chunk
            bitCount -= 8;  // Reset the bit counter
        }
    }

    // If there are leftover bits that don't form a full 3-bit value, add invalid value
    if (bitCount > 0 && bitCount < 8) {
        // Fill the remaining bits with the invalid value (e.g., 5 which is out of range [0,4])
        currentByte = currentByte << (8 - bitCount) | (1 << 8 - bitCount) - 1; 
        byteArray.push(currentByte);
    }

    // Convert the byte array into a Base64 string
    const uint8Array = new Uint8Array(byteArray);
    return btoa(String.fromCharCode.apply(null, uint8Array));
}

/*
 Sanitize a base64 string into a valid query string.
 */
function sanitizeBase64ToQueryString(base64) {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

