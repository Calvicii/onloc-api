import { User } from "../models/User.js";
import { getFileContent, writeToFile, getNextId } from "../utils.js";

export class UserService {
  constructor(filePath) {
    this.filePath = filePath;
  }

  loadUsers() {
    const fileContent = getFileContent(this.filePath);

    return fileContent.map(
      (user) => new User(user.id, user.username, user.password)
    );
  }

  addUser(username, password) {
    const users = this.loadUsers();
    const newUser = new User(getNextId(this.filePath), username, password);
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  saveUsers(users) {
    const rawData = users.map((user) => ({
        id: user.id,
        username: user.username,
        password: user.password,
    }));

    writeToFile(this.filePath, rawData);
  }
}
