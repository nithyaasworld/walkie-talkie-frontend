import "./App.css";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
const socket = io("http://localhost:3000", {autoConnect: false, transports: ["websocket"] });

function App() {
  let [listOfUsers, setListOfUsers] = useState([]);
  let [currUserName, setCurrUserName] = useState("");

  useEffect(() => {
    //Catching all listeners for debuggin purpose
    socket.onAny((event, ...args) => {
      console.log(event, args);
    });

    //Getting all connected list of users
    socket.on("users", (users) => {
      users.forEach((user) => {
        user.self = user.userID === socket.id;
      })
      setListOfUsers(users);
      console.log("users event fired: ", JSON.stringify(users));
    });

    //Setting username and connecting to the socket
    let name = prompt("Please enter your name");
    setCurrUserName(name);
    socket.auth = { username: name };
    socket.connect();
    socket.on("connect", () => {
      console.log(socket.id);
    });
    socket.on("connect_error", (err) => {
      if (err.message === "invalid username") {
        console.error("Please enter a valid user name");
      }
    });
    socket.on("user connected", (user) => {
      console.log("user connected event fired: ", user);
      // initReactiveProperties(user);
      // this.users.push(user);
    });

    return () => {
      socket.off("connect_error");
    }
  }, []);
  
  return (
    <div className="app-container">
      <h1>WalkieTalkie</h1>
      <div className="call-area">
        <div>{currUserName}</div>
        <button>Answer Button</button>
      </div>
      <div className="users-online">
        <h2>Users Online</h2>
        <div className="users-online-list-container">
          <ul className="users-online-list">
            {listOfUsers.length > 0 && listOfUsers.map(user => !user.self && <div className="user-online-card" key={user.userID}>
              <p>{user.username}</p>
              <button className="call-btn">Call</button>
            </div>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
export default App;
