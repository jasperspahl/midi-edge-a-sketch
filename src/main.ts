import "./styles.css"

import { error, info } from "./errors";

import p5 from "p5";



let midiInput: MIDIInput;

let selectingstate: "X" | "Y" | null = null;
let xControl: number | null = null;
let yControl: number | null = null;
let state: { x: number, y: number } = { x: 0, y: 0 };

const app = document.querySelector<HTMLDivElement>("#app")!;

function startSketch() {
  new p5(p => {
    let x: number, y: number;
    let clear = false;


    p.setup = () => {
      p.createCanvas(600, 600, p.WEBGL)
      p.background("#fffced");
      x = p.map(state.x, 0, 127, 0, 600);
      y = p.map(state.y, 0, 127, 600, 0);
      p.strokeWeight(600 / 127);
    }

    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2)
      if (clear) {
        p.background("#fffced");
        clear = false;
      }
      let newX = p.map(state.x, 0, 127, 0, 600);
      let newY = p.map(state.y, 0, 127, 600, 0);
      p.line(x, y, newX, newY);
      x = newX;
      y = newY;
    }

    p.keyPressed = () => {
      clear = true;
    }
  }, document.getElementById("p5")!);
}

function closeSettingsIfConfigured() {
  if (xControl !== null && yControl !== null) {
    const settings = document.querySelector<HTMLDetailsElement>("#midiSettings")!;
    settings.open = false;
    startSketch();
  }
}

function onMIDIMessage(this: MIDIInput, ev: Event) {
  const midiMessageDiv = document.querySelector<HTMLDivElement>("#midiMessage")!;
  const stateMessageDiv = document.querySelector<HTMLDivElement>("#stateMessage")!;
  if (ev instanceof MIDIMessageEvent) {
    const { data } = ev;
    const [status, note, velocity] = data!;
    midiMessageDiv.innerHTML = `Status: 0x${status.toString(16)} Note: ${note} Velocity: ${velocity}`;
    switch (status) {
      case 0xb0: // Control Change
        if (selectingstate === "X") {
          xControl = note;
          selectingstate = null;
          info`X Control Selected: ${note}`;
          closeSettingsIfConfigured()
        } else if (selectingstate === "Y") {
          yControl = note;
          selectingstate = null;
          info`Y Control Selected: ${note}`;
          closeSettingsIfConfigured()
        } else if (xControl === null && yControl === null) {
          error`No controls selected`;
        } else {
          if (xControl === note) {
            state.x = velocity;
          }
          if (yControl === note) {
            state.y = velocity;
          }
          stateMessageDiv.innerText = `State {x: ${state.x}, y: ${state.y}}`;
        }
        break;
    }
  } else {
    error`Midi Message Event is not an instance of MIDIMessageEvent`;
  }
}

function onMIDISuccess(midiAccess: MIDIAccess) {
  app.innerHTML = `<details id="midiSettings" open>
      <summary>Midi Settings</summary>
      <p>Inputs: ${midiAccess.inputs.size}</p>
      <select id="midiInput">
      </select>
      <button id="selectX" disabled>Select X Control</button>
      <button id="selectY" disabled>Select Y Control</button>
      <p id="midiMessage">Status: 00 Data 0: 00 Data 1: 00</p>
      <p id="stateMessage">State: {x: 0, y: 0}</p>
    </details>
  `

  const selectX = document.querySelector<HTMLButtonElement>("#selectX")!;
  const selectY = document.querySelector<HTMLButtonElement>("#selectY")!;
  selectX.addEventListener("click", () => {
    selectingstate = "X";
    info`Selecting X`;
  });
  selectY.addEventListener("click", () => {
    selectingstate = "Y";
    info`Selecting Y`;
  });

  const midiInputSelect = document.querySelector<HTMLSelectElement>("#midiInput")!;
  midiAccess.inputs.forEach((input) => {
    const option = new Option(`${input.name}`, input.id);
    midiInputSelect.add(option);
  });

  midiInputSelect.addEventListener("change", async () => {
    let input = midiAccess.inputs.get(midiInputSelect.value)!;
    if (midiInput) midiInput.onmidimessage = null;
    midiInput = input;
    input.onmidimessage = onMIDIMessage;
    const midiMessageDiv = document.querySelector<HTMLParagraphElement>("#midiMessage")!;
    midiMessageDiv.innerHTML = `Status: 00 Data 0: 00 Data 1: 00`;
    selectX.disabled = false;
    selectY.disabled = false;
  });

}

const setupMidi = async () => {
  navigator.requestMIDIAccess().then(
    onMIDISuccess,
    (err) => {
      error`Midi Access Denied: ${err}`;
    }
  );
}

const setupButton = document.querySelector<HTMLButtonElement>("button#setupMidi")!;

setupButton.addEventListener("click", setupMidi);
