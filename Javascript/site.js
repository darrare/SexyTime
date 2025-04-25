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