import fs from "fs";

export function getFileContent(path) {
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export function getObjectById(path, id) {
  try {
    const data = JSON.parse(fs.readFileSync(path, "utf8"));
    return data.find((item) => item.id === id);
  } catch (error) {
    return [];
  }
}

export function getLastId(path) {
  try {
    const data = getFileContent(path);

    if (data.length === 0) {
      throw new Error("File is empty");
    }

    return data[data.length - 1].id;
  } catch (error) {
    return null;
  }
}

export function getNextId(path) {
  try {
    const data = getFileContent(path);

    if (data.length === 0) {
      throw new Error("File is empty");
    }

    return data[data.length - 1].id + 1;
  } catch (error) {
    return 0;
  }
}
