"use strict";

class OfficeScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.characterLayer = document.getElementById("characterLayer");
    this.rooms = [];
    this.roomById = new Map();
    this.characters = [];
    this.selectedRoom = null;
    this.selectedCharacter = null;
    this.showModuleGrid = false;
    this.showNavigation = false;
    this.showPaths = true;
    this.autoRoam = true;
    this.paused = false;
    this.lastTime = performance.now();

    this.navigation = new NavigationGrid(
      WORLD_WIDTH / TILE_SIZE,
      WORLD_HEIGHT / TILE_SIZE,
      TILE_SIZE
    );

    this.view = {
      cssWidth: 0,
      cssHeight: 0,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      dpr: window.devicePixelRatio || 1
    };

    this.buildFromGrid(OFFICE_LAYOUT);
    this.connectLayout(CONNECTIONS);
    this.rooms.find(room => room.id === "reception")
      .addDoor("south", MODULE_WIDTH / 2, true);

    this.rebuildNavigation();
    this.spawnCharacters();

    this.selectedRoom = this.rooms[0];
    this.selectedCharacter = this.characters[0];
    this.selectedCharacter.selected = true;

    this.bindEvents();
    this.resize();

    requestAnimationFrame(time => this.loop(time));
  }

  buildFromGrid(layout) {
    for (const spec of layout.rooms) {
      const room = RoomFactory.create(this, spec);
      this.rooms.push(room);
      this.roomById.set(room.id, room);
    }
  }

  connectLayout(connections) {
    for (const connection of connections) {
      const roomA = this.roomById.get(connection.a);
      const roomB = this.roomById.get(connection.b);
      this.connectRooms(roomA, roomB, connection.ratio ?? 0.5);
    }
  }

  connectRooms(roomA, roomB, ratio = 0.5) {
    const overlapYStart = Math.max(roomA.y, roomB.y);
    const overlapYEnd = Math.min(roomA.bottom, roomB.bottom);
    const overlapXStart = Math.max(roomA.x, roomB.x);
    const overlapXEnd = Math.min(roomA.right, roomB.right);

    if (almostEqual(roomA.right, roomB.x) && overlapYEnd > overlapYStart) {
      const position = overlapYStart + (overlapYEnd - overlapYStart) * ratio;
      roomA.addDoor("east", position);
      roomB.addDoor("west", position);
      return;
    }

    if (almostEqual(roomB.right, roomA.x) && overlapYEnd > overlapYStart) {
      const position = overlapYStart + (overlapYEnd - overlapYStart) * ratio;
      roomA.addDoor("west", position);
      roomB.addDoor("east", position);
      return;
    }

    if (almostEqual(roomA.bottom, roomB.y) && overlapXEnd > overlapXStart) {
      const position = overlapXStart + (overlapXEnd - overlapXStart) * ratio;
      roomA.addDoor("south", position);
      roomB.addDoor("north", position);
      return;
    }

    if (almostEqual(roomB.bottom, roomA.y) && overlapXEnd > overlapXStart) {
      const position = overlapXStart + (overlapXEnd - overlapXStart) * ratio;
      roomA.addDoor("north", position);
      roomB.addDoor("south", position);
      return;
    }

    console.warn(`Rooms ${roomA.id} and ${roomB.id} are not adjacent.`);
  }

  rebuildNavigation() {
    this.navigation.walkable.fill(0);
    this.rooms.forEach(room => room.buildNavigation(this.navigation));
  }

  spawnCharacters() {
    const spawn = roomId => {
      const room = this.roomById.get(roomId);
      return this.randomWalkablePoint(room);
    };

    const definitions = [
      {
        name: "Maya",
        role: "Project Manager",
        gender: "female",
        room: "pm",
        jacket: "#264f82",
        jacketLight: "#3b6bab",
        pants: "#232b36",
        pantsLight: "#334151",
        hair: "#1f2630",
        hairHighlight: "#3f4953",
        skin: "#ffc49d",
        skinDark: "#f1b58d",
        scale: 0.8
      },
      {
        name: "Devon",
        role: "Developer",
        gender: "male",
        room: "developers",
        jacket: "#2f7a5f",
        jacketLight: "#44a47f",
        pants: "#232b36",
        pantsLight: "#334151",
        hair: "#232831",
        hairHighlight: "#4a525e",
        skin: "#f2c29f",
        skinDark: "#e2ad86",
        scale: 0.79
      },
      {
        name: "Noor",
        role: "Designer",
        gender: "female",
        room: "designers",
        jacket: "#8150ac",
        jacketLight: "#9a6fc3",
        pants: "#2a2e39",
        pantsLight: "#414757",
        hair: "#4a2c22",
        hairHighlight: "#6f4639",
        skin: "#dca07e",
        skinDark: "#c68b6d",
        scale: 0.8
      },
      {
        name: "Ari",
        role: "Reception",
        gender: "male",
        room: "reception",
        jacket: "#b26437",
        jacketLight: "#cf8354",
        pants: "#28313c",
        pantsLight: "#3a4655",
        hair: "#2b2b31",
        hairHighlight: "#50535a",
        skin: "#c98b63",
        skinDark: "#b27552",
        scale: 0.78
      }
    ];

    for (const definition of definitions) {
      const point = spawn(definition.room) || { x: 100, y: 100 };
      this.characters.push(
        new OfficeCharacter(this, {
          ...definition,
          x: point.x,
          y: point.y,
          speed: 58 + Math.random() * 12
        })
      );
    }
  }

  randomWalkablePoint(room = null) {
    const targetRoom = room || this.rooms[Math.floor(Math.random() * this.rooms.length)];

    const minCell = this.navigation.worldToCell(targetRoom.x + TILE_SIZE, targetRoom.y + TILE_SIZE);
    const maxCell = this.navigation.worldToCell(
      targetRoom.right - TILE_SIZE,
      targetRoom.bottom - TILE_SIZE
    );

    for (let attempt = 0; attempt < 80; attempt += 1) {
      const x = Math.floor(minCell.x + Math.random() * (maxCell.x - minCell.x + 1));
      const y = Math.floor(minCell.y + Math.random() * (maxCell.y - minCell.y + 1));

      if (this.navigation.isWalkable(x, y)) {
        return this.navigation.cellToWorld(x, y);
      }
    }

    return null;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.view.cssWidth = rect.width;
    this.view.cssHeight = rect.height;
    this.view.dpr = dpr;
    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));

    const scale = Math.min(rect.width / WORLD_WIDTH, rect.height / WORLD_HEIGHT);
    this.view.scale = scale;
    this.view.offsetX = (rect.width - WORLD_WIDTH * scale) / 2;
    this.view.offsetY = (rect.height - WORLD_HEIGHT * scale) / 2;

    this.characters.forEach(character => character.updateDOM(this.view, performance.now()));
  }

  clientToWorld(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();

    return {
      x: (clientX - rect.left - this.view.offsetX) / this.view.scale,
      y: (clientY - rect.top - this.view.offsetY) / this.view.scale
    };
  }

  bindEvents() {
    const observer = new ResizeObserver(() => this.resize());
    observer.observe(this.canvas);

    this.canvas.addEventListener("pointerdown", event => {
      const point = this.clientToWorld(event.clientX, event.clientY);

      const hitRoom = this.rooms.find(room => room.containsPoint(point.x, point.y));
      if (hitRoom) {
        this.selectedRoom = hitRoom;
      }

      if (this.selectedCharacter) {
        this.selectedCharacter.setTarget(point.x, point.y, true);
      }

      updateSidePanel(this);
    });
  }

  selectCharacter(character) {
    this.characters.forEach(item => { item.selected = false; item.updateDOM(this.view, performance.now()); });
    this.selectedCharacter = character;
    character.selected = true;
    character.updateDOM(this.view, performance.now());

    const room = this.rooms.find(item => item.containsPoint(character.x, character.y));
    if (room) this.selectedRoom = room;

    const select = document.getElementById("characterSelect");
    if (select) select.value = character.name;
  }

  selectRoom(roomId) {
    const room = this.roomById.get(roomId);
    if (!room) return;

    this.selectedRoom = room;

    if (this.selectedCharacter) {
      const target = this.randomWalkablePoint(room);
      if (target) this.selectedCharacter.setTarget(target.x, target.y, true);
    }

    updateSidePanel(this);
  }

  update(delta) {
    if (this.paused) return;
    this.characters.forEach(character => character.update(delta));

    if (this.selectedCharacter) {
      const room = this.rooms.find(item =>
        item.containsPoint(this.selectedCharacter.x, this.selectedCharacter.y)
      );

      if (room) this.selectedRoom = room;
    }
  }

  draw() {
    const ctx = this.ctx;
    const { dpr, scale, offsetX, offsetY, cssWidth, cssHeight } = this.view;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.fillStyle = "#07131f";
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    ctx.setTransform(
      dpr * scale,
      0,
      0,
      dpr * scale,
      dpr * offsetX,
      dpr * offsetY
    );

    ctx.fillStyle = "#0e2030";
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    for (const room of this.rooms) {
      room.draw(ctx, room === this.selectedRoom);
    }

    if (this.showModuleGrid) {
      this.drawModuleGrid(ctx);
    }

    if (this.showNavigation) {
      this.navigation.draw(ctx);
    }

    if (this.showPaths && this.selectedCharacter?.path.length > 1) {
      this.drawPath(ctx, this.selectedCharacter);
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    [...this.characters]
      .sort((a, b) => a.y - b.y)
      .forEach(character => character.updateDOM(this.view, this.lastTime));
  }

  drawModuleGrid(ctx) {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 185, 90, .8)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]);

    for (let x = 0; x <= WORLD_WIDTH; x += MODULE_WIDTH) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, WORLD_HEIGHT);
      ctx.stroke();
    }

    for (let y = 0; y <= WORLD_HEIGHT; y += MODULE_HEIGHT) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WORLD_WIDTH, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawPath(ctx, character) {
    ctx.save();
    ctx.strokeStyle = "rgba(88, 224, 218, .9)";
    ctx.lineWidth = 3;
    ctx.setLineDash([7, 6]);
    ctx.beginPath();
    ctx.moveTo(character.x, character.y);

    for (let i = character.pathIndex; i < character.path.length; i += 1) {
      ctx.lineTo(character.path[i].x, character.path[i].y);
    }

    ctx.stroke();
    ctx.restore();
  }

  loop(time) {
    const delta = Math.min(0.04, (time - this.lastTime) / 1000);
    this.lastTime = time;

    this.update(delta);
    this.draw();

    requestAnimationFrame(next => this.loop(next));
  }
}

const OFFICE_LAYOUT = {
  columns: MODULE_COLUMNS,
  rows: MODULE_ROWS,
  rooms: [
    { id: "reception", type: "reception", name: "Reception", x: 0, y: 0, w: 1, h: 1 },
    { id: "meeting-main", type: "meeting", name: "Main Meeting Room", x: 1, y: 0, w: 2, h: 1 },
    { id: "pm", type: "pm", name: "PM Room", x: 3, y: 0, w: 1, h: 1 },

    { id: "developers", type: "developers", name: "Developer Room", x: 0, y: 1, w: 2, h: 1 },
    { id: "designers", type: "designers", name: "Designer Room", x: 2, y: 1, w: 1, h: 1 },
    { id: "coffee", type: "coffee", name: "Coffee Area", x: 3, y: 1, w: 1, h: 1 },

    { id: "toilets", type: "toilets", name: "Toilets", x: 0, y: 2, w: 1, h: 1 },
    { id: "huddle", type: "meeting", name: "Huddle Room", x: 1, y: 2, w: 1, h: 1 },
    { id: "qa", type: "developers", name: "QA / Engineering", x: 2, y: 2, w: 2, h: 1 }
  ]
};

const CONNECTIONS = [
  { a: "reception", b: "meeting-main", ratio: 0.5 },
  { a: "meeting-main", b: "pm", ratio: 0.5 },

  { a: "reception", b: "developers", ratio: 0.5 },
  { a: "meeting-main", b: "developers", ratio: 0.5 },
  { a: "meeting-main", b: "designers", ratio: 0.5 },
  { a: "pm", b: "coffee", ratio: 0.5 },

  { a: "developers", b: "designers", ratio: 0.55 },
  { a: "designers", b: "coffee", ratio: 0.5 },

  { a: "developers", b: "toilets", ratio: 0.5 },
  { a: "developers", b: "huddle", ratio: 0.5 },
  { a: "designers", b: "qa", ratio: 0.5 },
  { a: "coffee", b: "qa", ratio: 0.5 },

  { a: "toilets", b: "huddle", ratio: 0.5 },
  { a: "huddle", b: "qa", ratio: 0.5 }
];

function buildRoomList(scene) {
  const list = document.getElementById("roomList");
  list.innerHTML = "";

  for (const room of scene.rooms) {
    const button = document.createElement("button");
    button.className = "room-button";
    button.dataset.roomId = room.id;
    button.innerHTML = `
      <span class="room-swatch" style="background:${room.accentColor}"></span>
      <span>
        <strong>${room.name}</strong>
        <small>${room.className} · ${room.gridWidth}×${room.gridHeight} module</small>
      </span>
    `;
    button.addEventListener("click", () => scene.selectRoom(room.id));
    list.appendChild(button);
  }
}

function updateSidePanel(scene) {
  const room = scene.selectedRoom;
  const character = scene.selectedCharacter;

  if (room) {
    document.getElementById("roomName").textContent = room.name;
    document.getElementById("roomClass").textContent = room.className;
    document.getElementById("roomModules").textContent =
      `${room.gridWidth} × ${room.gridHeight}`;
    document.getElementById("roomDoors").textContent = room.doors.length;
    document.getElementById("roomBlockers").textContent = room.blockers.length;

    document.querySelectorAll(".room-button").forEach(button => {
      button.classList.toggle("active", button.dataset.roomId === room.id);
    });
  }

  if (character) {
    document.getElementById("characterName").textContent = character.name;
    document.getElementById("characterRole").textContent = character.role;
    document.getElementById("characterPath").textContent =
      character.path.length > 0
        ? `${Math.max(0, character.path.length - character.pathIndex)} tiles`
        : "Idle";
  }
}

const scene = new OfficeScene(document.getElementById("officeCanvas"));
buildRoomList(scene);
updateSidePanel(scene);

document.getElementById("characterSelect").addEventListener("change", event => {
  const character = scene.characters.find(item => item.name === event.target.value);
  if (character) {
    scene.selectCharacter(character);
    updateSidePanel(scene);
  }
});

for (const character of scene.characters) {
  const option = document.createElement("option");
  option.value = character.name;
  option.textContent = `${character.name} · ${character.role}`;
  document.getElementById("characterSelect").appendChild(option);
}
document.getElementById("characterSelect").value = scene.selectedCharacter.name;

document.getElementById("toggleModules").addEventListener("click", event => {
  scene.showModuleGrid = !scene.showModuleGrid;
  event.currentTarget.classList.toggle("active", scene.showModuleGrid);
});

document.getElementById("toggleNavigation").addEventListener("click", event => {
  scene.showNavigation = !scene.showNavigation;
  event.currentTarget.classList.toggle("active", scene.showNavigation);
});

document.getElementById("togglePaths").addEventListener("click", event => {
  scene.showPaths = !scene.showPaths;
  event.currentTarget.classList.toggle("active", scene.showPaths);
});

document.getElementById("toggleRoam").addEventListener("click", event => {
  scene.autoRoam = !scene.autoRoam;
  event.currentTarget.classList.toggle("active", scene.autoRoam);
});

document.getElementById("togglePause").addEventListener("click", event => {
  scene.paused = !scene.paused;
  event.currentTarget.classList.toggle("active", scene.paused);
  event.currentTarget.textContent = scene.paused ? "Resume" : "Pause";
});

setInterval(() => updateSidePanel(scene), 500);
