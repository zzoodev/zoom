const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("#openRoom");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", { room_name: input.value }, () => {
    console.log("hi im client");
  });
  input.value = "";
});
