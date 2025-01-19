import './style.css'

// generate a function that returns a CSS conic-gradient that covers a percentage of a circle in green, then stops at a percentage of a circle in red
function generateGradient(percent: number) {
  const gradient = `conic-gradient(
    #00FF00 ${percent / 100 * 360}deg,
    #242424 ${percent / 100 * 360}deg,
    #242424 360deg
  )`
  return gradient
}

function hms(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsRemaining = seconds % 60;
  return `${hours}h ${minutes}m ${secondsRemaining}s`;
}

class Clock {
  name!: string;
  totalTime!: number;
  doneTime!: number;
  running: boolean = false;

  startButton!: HTMLButtonElement;
  inside!: HTMLDivElement;
  circle!: HTMLDivElement;

  clock!: HTMLDivElement;

  constructor(name: string) {

    console.log(name);

    let { doneTime, totalTime, dueAddStart } = JSON.parse(localStorage.getItem(name)!);

    if (dueAddStart !== undefined) {
      doneTime += Math.floor(Date.now() / 1000) - dueAddStart;
    }

    localStorage.setItem(name, JSON.stringify({ doneTime, totalTime }));
    this.populate(name, totalTime, doneTime, dueAddStart !== undefined);
  }

  populate(name: string, totalTime: number, doneTime: number, running: boolean) {
    this.name = name;
    this.totalTime = totalTime;
    this.doneTime = doneTime;

    const clock = document.createElement("div");
    clock.classList.add("clock");

    const h2 = document.createElement("h2");
    h2.textContent = name;
    clock.appendChild(h2);

    this.circle = document.createElement("div");
    this.circle.classList.add("circle");
    this.circle.style.background = generateGradient(doneTime / totalTime * 100);
    this.inside = document.createElement("div");
    this.inside.classList.add("inside");
    this.inside.textContent = hms(doneTime);
    this.circle.appendChild(this.inside);
    clock.appendChild(this.circle);

    const buttons = document.createElement("div");
    buttons.classList.add("buttons");

    this.startButton = document.createElement("button");
    this.startButton.classList.add("start");
    this.startButton.textContent = "Start";
    this.startButton.addEventListener("click", () => this.toggle());
    buttons.appendChild(this.startButton);

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete");
    deleteButton.textContent = "Delete";
    buttons.appendChild(deleteButton);
    deleteButton.onclick = () => this.delete();

    clock.appendChild(buttons);

    document.querySelector(".clocks")!.appendChild(clock);
    this.clock = clock;

    if (running) this.toggle();
  }

  toggle() {
    if (!this.running) {
      this.startButton.className = "delete";
      this.startButton.innerText = "Stop";
      this.running = true;
      localStorage.setItem(this.name, JSON.stringify({ doneTime: this.doneTime, totalTime: this.totalTime, dueAddStart: Math.floor(Date.now() / 1000) }));
      const interval = setInterval(() => {

        if (!this.running) {
          clearInterval(interval);
          this.running = false;
          return
        }

        this.doneTime++;
        this.inside.textContent = hms(this.doneTime);
        this.circle.style.background = generateGradient(this.doneTime / this.totalTime * 100);

      }, 1000); // TODO: MULTIPLY BY 60 to make it minutes
    } else {
      localStorage.setItem(this.name, JSON.stringify({ doneTime: this.doneTime, totalTime: this.totalTime }));
      this.startButton.className = "start";
      this.startButton.innerText = "Start";
      this.running = false;
    }
  }

  delete() {
    if (confirm("Are you sure you want to delete this clock?")) {
      this.running = false;
      this.clock.remove();
      localStorage.removeItem(this.name);
    }
  }
}

document.getElementById("add")!.addEventListener("click", () => {
  const name = prompt("Enter the name of the clock:");
  const totalTime = Number(prompt("Enter the total time in hours:"));

  if (localStorage.getItem(name!) !== null) {
    alert("A clock with this name already exists.");
    return;
  }

  if (name && totalTime) {
    localStorage.setItem(name, JSON.stringify({ doneTime: 0, totalTime: totalTime * 3600 }));
    new Clock(name);
  }
});

let shouldReset = false;

const lastMondayStr = localStorage.getItem("____lastMonday____");
if (lastMondayStr === null) {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  const lastMonday = new Date(today); // Copy the current date

  // Adjust to the last Monday
  lastMonday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  localStorage.setItem("____lastMonday____", Math.floor(lastMonday.getTime() / 1000).toString());
} else {
  const lastMonday = new Date(parseInt(lastMondayStr) * 1000);
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday

  if (dayOfWeek === 1 && lastMonday.getDate() !== today.getDate()) {
    shouldReset = true;
    localStorage.setItem("____lastMonday____", Math.floor(today.getTime() / 1000).toString());
  }
}

for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i)!;
  if (key !== "____lastMonday____") {
    if (shouldReset) {
      const { doneTime, totalTime } = JSON.parse(localStorage.getItem(key)!);
      if (doneTime < totalTime) {
        alert("FAILED " + key + "! Do better!!!!");
      }
      localStorage.setItem(key, JSON.stringify({ doneTime: 0, totalTime }));
    }
    console.log("CALL " + key);
    new Clock(key);
  }
}

if (navigator.serviceWorker) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' })
}