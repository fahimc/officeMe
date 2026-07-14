"use strict";

class ReceptionRoom extends BaseRoom {
  constructor(scene, spec) {
    super(scene, {
      ...spec,
      floorColor: "#d7d4ce",
      accentColor: "#4aa7ff"
    });

    this.addBlocker(78, 78, 132, 58);
    this.addBlocker(24, 146, 80, 38);
    this.addBlocker(222, 140, 36, 36);
  }

  drawContents(ctx) {
    ctx.save();

    fillRoundedRect(
      ctx,
      this.x + 78,
      this.y + 78,
      132,
      58,
      18,
      "#f3f6f8",
      "#172638",
      4
    );

    ctx.fillStyle = "#24394c";
    ctx.fillRect(this.x + 120, this.y + 94, 48, 22);

    fillRoundedRect(
      ctx,
      this.x + 24,
      this.y + 146,
      80,
      38,
      12,
      "#285d7e",
      "#172638",
      3
    );

    this.drawPlant(ctx, this.x + 240, this.y + 158, 17);

    ctx.fillStyle = "#2d6fcb";
    ctx.font = "900 22px Inter, system-ui, sans-serif";
    ctx.fillText("N", this.x + 226, this.y + 86);

    ctx.restore();
  }
}

class DeveloperRoom extends BaseRoom {
  constructor(scene, spec) {
    super(scene, {
      ...spec,
      floorColor: "#d6dce2",
      accentColor: "#4aa7ff"
    });

    const rows = [
      { y: 64, x: 48 },
      { y: 136, x: 48 }
    ];

    for (const row of rows) {
      for (let x = row.x; x < this.width - 120; x += 164) {
        this.addBlocker(x, row.y, 126, 48);
      }
    }
  }

  drawContents(ctx) {
    for (const y of [this.y + 64, this.y + 136]) {
      for (let x = this.x + 48; x < this.right - 120; x += 164) {
        this.drawDesk(ctx, x, y, 126, 48, 2);
        this.drawChair(ctx, x + 34, y + 66);
        this.drawChair(ctx, x + 92, y + 66);
      }
    }

    for (let x = this.x + 24; x < this.right - 20; x += 190) {
      this.drawPlant(ctx, x, this.y + 188, 11);
    }
  }
}

class DesignerRoom extends BaseRoom {
  constructor(scene, spec) {
    super(scene, {
      ...spec,
      floorColor: "#e4d7dd",
      accentColor: "#b661d1"
    });

    this.addBlocker(62, 72, 158, 70);
    this.addBlocker(30, 156, 72, 30);
  }

  drawContents(ctx) {
    fillRoundedRect(
      ctx,
      this.x + 62,
      this.y + 72,
      158,
      70,
      10,
      "#c78d63",
      "#172638",
      3
    );

    ctx.fillStyle = "#fafafa";
    ctx.fillRect(this.x + 83, this.y + 88, 52, 34);
    ctx.fillRect(this.x + 148, this.y + 88, 52, 34);

    const colors = ["#ff7a7a", "#ffcb63", "#67d6a0", "#62a8ff", "#b979e7"];
    colors.forEach((color, index) => {
      ctx.fillStyle = color;
      ctx.fillRect(this.x + 38 + index * 35, this.y + 163, 24, 18);
    });

    this.drawChair(ctx, this.x + 102, this.y + 158);
    this.drawChair(ctx, this.x + 180, this.y + 158);
  }
}

class PMRoom extends BaseRoom {
  constructor(scene, spec) {
    super(scene, {
      ...spec,
      floorColor: "#e1d7c9",
      accentColor: "#ffb662"
    });

    this.addBlocker(68, 80, 150, 64);
    this.addBlocker(28, 152, 56, 30);
    this.addBlocker(224, 66, 34, 98);
  }

  drawContents(ctx) {
    this.drawDesk(ctx, this.x + 68, this.y + 80, 150, 64, 2);
    this.drawChair(ctx, this.x + 142, this.y + 162);

    fillRoundedRect(
      ctx,
      this.x + 224,
      this.y + 66,
      34,
      98,
      7,
      "#6f523d",
      "#172638",
      3
    );

    ctx.fillStyle = "#f0f5f8";
    ctx.fillRect(this.x + 28, this.y + 152, 56, 30);
    ctx.fillStyle = "#4aa7ff";
    ctx.fillRect(this.x + 36, this.y + 160, 16, 6);
    ctx.fillStyle = "#78e79b";
    ctx.fillRect(this.x + 58, this.y + 160, 16, 6);
  }
}

class ToiletRoom extends BaseRoom {
  constructor(scene, spec) {
    super(scene, {
      ...spec,
      floorColor: "#d7e5e8",
      accentColor: "#60b9c8"
    });

    this.addBlocker(24, 58, 92, 118);
    this.addBlocker(132, 58, 92, 118);
    this.addBlocker(230, 88, 32, 66);
  }

  drawContents(ctx) {
    for (const x of [this.x + 24, this.x + 132]) {
      fillRoundedRect(ctx, x, this.y + 58, 92, 118, 7, "#eef5f6", "#172638", 3);
      fillRoundedRect(ctx, x + 28, this.y + 112, 36, 42, 12, "#ffffff", "#71818c", 2);
    }

    fillRoundedRect(
      ctx,
      this.x + 230,
      this.y + 88,
      32,
      66,
      7,
      "#b4cbd2",
      "#172638",
      3
    );
  }
}

class CoffeeRoom extends BaseRoom {
  constructor(scene, spec) {
    super(scene, {
      ...spec,
      floorColor: "#ded5ca",
      accentColor: "#d9854d"
    });

    this.addBlocker(26, 60, 236, 54);
    this.addBlocker(78, 136, 132, 52);
  }

  drawContents(ctx) {
    fillRoundedRect(
      ctx,
      this.x + 26,
      this.y + 60,
      236,
      54,
      8,
      "#6e5140",
      "#172638",
      3
    );

    ctx.fillStyle = "#25384a";
    ctx.fillRect(this.x + 48, this.y + 72, 36, 30);
    ctx.fillStyle = "#d96a45";
    ctx.fillRect(this.x + 102, this.y + 72, 28, 30);
    ctx.fillStyle = "#8bd3c7";
    ctx.fillRect(this.x + 150, this.y + 72, 54, 30);

    fillRoundedRect(
      ctx,
      this.x + 78,
      this.y + 136,
      132,
      52,
      26,
      "#c88c55",
      "#172638",
      3
    );

    this.drawChair(ctx, this.x + 64, this.y + 162, Math.PI / 2);
    this.drawChair(ctx, this.x + 224, this.y + 162, -Math.PI / 2);
  }
}

class MeetingRoom extends BaseRoom {
  constructor(scene, spec) {
    super(scene, {
      ...spec,
      floorColor: "#d9dde1",
      accentColor: "#7c8ea3"
    });

    this.addBlocker(76, 66, this.width - 152, 86);
    this.addBlocker(42, 24, this.width - 84, 26);
  }

  drawContents(ctx) {
    fillRoundedRect(
      ctx,
      this.x + 76,
      this.y + 66,
      this.width - 152,
      86,
      42,
      "#95653f",
      "#172638",
      4
    );

    for (let x = this.x + 118; x < this.right - 100; x += 86) {
      this.drawChair(ctx, x, this.y + 54, Math.PI);
      this.drawChair(ctx, x, this.y + 166, 0);
    }

    fillRoundedRect(
      ctx,
      this.x + 42,
      this.y + 24,
      this.width - 84,
      26,
      6,
      "#f4f7f9",
      "#172638",
      3
    );

    ctx.strokeStyle = "#4aa7ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.x + 72, this.y + 42);
    ctx.lineTo(this.x + 118, this.y + 32);
    ctx.lineTo(this.x + 164, this.y + 40);
    ctx.stroke();
  }
}

const ROOM_TYPES = {
  reception: ReceptionRoom,
  developers: DeveloperRoom,
  designers: DesignerRoom,
  pm: PMRoom,
  toilets: ToiletRoom,
  coffee: CoffeeRoom,
  meeting: MeetingRoom
};

class RoomFactory {
  static create(scene, spec) {
    const RoomClass = ROOM_TYPES[spec.type];
    if (!RoomClass) {
      throw new Error(`Unknown room type: ${spec.type}`);
    }
    return new RoomClass(scene, spec);
  }
}
