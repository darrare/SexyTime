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
 Shows a notice to the user. Will eventually be changed to be cleaner than just alert.
 */
 function showNotice(message) {
  alert(message);
}

/*
Pack the array into a base64 string
 */
function packArrayToBase64(arr, isFemale) {
  let byteArray = [];
  let currentByte = 0;
  let bitCount = 0;

  // The dataHidingByte will be used to store other tidbits of data that isn't the actual array
  var dataHidingByte = 0;
  if (isFemale) {
    dataHidingByte |= (1 << 0);
  }
  byteArray.push(dataHidingByte);

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

/*
Reads the query string and converts it to data.
*/
function readQueryStringDataAndGetResult(url, paramName) {
  try {
      var queryParams = new URL(url).searchParams;
      var queryString = queryParams.get(paramName);
      if (queryString == null) {
          throw "Unable to pull the data from the query string.";
      }    
      var originalBase64String = convertSanitizedQueryStringToBase64(queryString);
      var decodedData = decodeBase64ToArray(originalBase64String);
      return decodedData;
  } catch (error) {
      showNotice(error);
  }
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

/*
Decode a base64 string into an int array.
Specifically in a scenario where the array can only hold values 0-4
*/
function decodeBase64ToArray(base64Str) {
  // Step 1: Decode the Base64 string to a byte array
  const byteString = atob(base64Str);
  const byteArray = Array.from(byteString, char => char.charCodeAt(0));

  // Step 2: Unpack the byte array back into the original array of integers
  let dataArray = [];
  let currentBits = 0;
  let bitCount = 0;

  var hiddenDataByte = byteArray[0];
  var isFemale = (hiddenDataByte & (1 << 0) !== 0);

  for (let i = 1; i < byteArray.length; i++) {
      // Add the byte to the current bits accumulator
      currentBits = (currentBits << 8) | byteArray[i];
      bitCount += 8;

      // Extract 3-bit chunks from the current bits
      while (bitCount >= 3) {
          // Extract the 3-bit value
          const value = (currentBits >> (bitCount - 3)) & 0x7; // 0x7 is binary 111

          // If we find a value of 7, it means we should stop because this is our exit condition.
          if (value === 7) { return {isFemale, dataArray};}
          
          dataArray.push(value);

          // Remove the extracted bits
          bitCount -= 3;
      }
  }

  return {isFemale, dataArray};
}

/*
Returns an array that simply contains the IDs in order of the quiz sections JSON
*/
function getQuestionIdsMapped(quizSectionsJson) {
  return quizSectionsJson.sections.flatMap(section => 
      section.questions.map(question => question.id)
    );
}

/*
Initialize the personal url section of this page.
*/
function initializeStaticUrlInput(input) {
  input.val(window.location.href);

  const tooltip = bootstrap.Tooltip.getOrCreateInstance(input[0]);

  input.on('click', function () {
    input[0].select();
    input[0].setSelectionRange(0, 99999); // for mobile

    navigator.clipboard.writeText(input.val()).then(() => {
      input.attr('data-bs-original-title', 'Copied!');
      tooltip.show();

      setTimeout(() => {
        tooltip.hide();
      }, 1500);
    });
  });
}