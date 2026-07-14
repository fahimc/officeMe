"use strict";

const MODULE_WIDTH = 288;
const MODULE_HEIGHT = 216;
const MODULE_COLUMNS = 4;
const MODULE_ROWS = 3;
const TILE_SIZE = 24;
const WORLD_WIDTH = MODULE_WIDTH * MODULE_COLUMNS;
const WORLD_HEIGHT = MODULE_HEIGHT * MODULE_ROWS;
const TILES_PER_MODULE_X = MODULE_WIDTH / TILE_SIZE;
const TILES_PER_MODULE_Y = MODULE_HEIGHT / TILE_SIZE;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const almostEqual = (a, b) => Math.abs(a - b) < 0.01;

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function fillRoundedRect(ctx, x, y, width, height, radius, fill, stroke = null, lineWidth = 1) {
  roundedRect(ctx, x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

class NavigationGrid {
  constructor(columns, rows, tileSize) {
    this.columns = columns;
    this.rows = rows;
    this.tileSize = tileSize;
    this.walkable = new Uint8Array(columns * rows);
  }

  index(x, y) {
    return y * this.columns + x;
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.columns && y < this.rows;
  }

  setWalkable(x, y, value) {
    if (!this.inBounds(x, y)) return;
    this.walkable[this.index(x, y)] = value ? 1 : 0;
  }

  isWalkable(x, y) {
    return this.inBounds(x, y) && this.walkable[this.index(x, y)] === 1;
  }

  worldToCell(x, y) {
    return {
      x: clamp(Math.floor(x / this.tileSize), 0, this.columns - 1),
      y: clamp(Math.floor(y / this.tileSize), 0, this.rows - 1)
    };
  }

  cellToWorld(x, y) {
    return {
      x: x * this.tileSize + this.tileSize / 2,
      y: y * this.tileSize + this.tileSize / 2
    };
  }

  nearestWalkable(cell, maxRadius = 10) {
    if (this.isWalkable(cell.x, cell.y)) return cell;

    for (let radius = 1; radius <= maxRadius; radius += 1) {
      for (let y = cell.y - radius; y <= cell.y + radius; y += 1) {
        for (let x = cell.x - radius; x <= cell.x + radius; x += 1) {
          const onEdge =
            x === cell.x - radius ||
            x === cell.x + radius ||
            y === cell.y - radius ||
            y === cell.y + radius;

          if (onEdge && this.isWalkable(x, y)) return { x, y };
        }
      }
    }

    return null;
  }

  findPath(startCell, endCell) {
    const start = this.nearestWalkable(startCell);
    const goal = this.nearestWalkable(endCell);

    if (!start || !goal) return [];

    const total = this.columns * this.rows;
    const cameFrom = new Int32Array(total);
    cameFrom.fill(-1);

    const gScore = new Float64Array(total);
    gScore.fill(Number.POSITIVE_INFINITY);

    const fScore = new Float64Array(total);
    fScore.fill(Number.POSITIVE_INFINITY);

    const open = [];
    const openSet = new Uint8Array(total);

    const startIndex = this.index(start.x, start.y);
    const goalIndex = this.index(goal.x, goal.y);

    gScore[startIndex] = 0;
    fScore[startIndex] = Math.abs(start.x - goal.x) + Math.abs(start.y - goal.y);
    open.push(startIndex);
    openSet[startIndex] = 1;

    const neighbours = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ];

    while (open.length > 0) {
      let bestPosition = 0;
      for (let i = 1; i < open.length; i += 1) {
        if (fScore[open[i]] < fScore[open[bestPosition]]) bestPosition = i;
      }

      const currentIndex = open.splice(bestPosition, 1)[0];
      openSet[currentIndex] = 0;

      if (currentIndex === goalIndex) {
        const path = [];
        let cursor = currentIndex;

        while (cursor !== -1) {
          const x = cursor % this.columns;
          const y = Math.floor(cursor / this.columns);
          path.push(this.cellToWorld(x, y));
          cursor = cameFrom[cursor];
        }

        path.reverse();
        return path;
      }

      const currentX = currentIndex % this.columns;
      const currentY = Math.floor(currentIndex / this.columns);

      for (const [dx, dy] of neighbours) {
        const nx = currentX + dx;
        const ny = currentY + dy;
        if (!this.isWalkable(nx, ny)) continue;

        const neighbourIndex = this.index(nx, ny);
        const tentative = gScore[currentIndex] + 1;

        if (tentative < gScore[neighbourIndex]) {
          cameFrom[neighbourIndex] = currentIndex;
          gScore[neighbourIndex] = tentative;
          fScore[neighbourIndex] =
            tentative + Math.abs(nx - goal.x) + Math.abs(ny - goal.y);

          if (!openSet[neighbourIndex]) {
            open.push(neighbourIndex);
            openSet[neighbourIndex] = 1;
          }
        }
      }
    }

    return [];
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.28;

    for (let y = 0; y < this.rows; y += 1) {
      for (let x = 0; x < this.columns; x += 1) {
        ctx.fillStyle = this.isWalkable(x, y)
          ? "rgba(88, 224, 218, .45)"
          : "rgba(255, 92, 92, .34)";
        ctx.fillRect(
          x * this.tileSize + 2,
          y * this.tileSize + 2,
          this.tileSize - 4,
          this.tileSize - 4
        );
      }
    }

    ctx.restore();
  }
}

class BaseRoom {
  constructor(scene, spec) {
    this.scene = scene;
    this.id = spec.id;
    this.type = spec.type;
    this.name = spec.name;
    this.gridX = spec.x;
    this.gridY = spec.y;
    this.gridWidth = spec.w || 1;
    this.gridHeight = spec.h || 1;
    this.floorColor = spec.floorColor || "#d8dde4";
    this.wallColor = spec.wallColor || "#172638";
    this.accentColor = spec.accentColor || "#4aa7ff";
    this.doors = [];
    this.blockers = [];
    this.className = this.constructor.name;
  }

  get x() {
    return this.gridX * MODULE_WIDTH;
  }

  get y() {
    return this.gridY * MODULE_HEIGHT;
  }

  get width() {
    return this.gridWidth * MODULE_WIDTH;
  }

  get height() {
    return this.gridHeight * MODULE_HEIGHT;
  }

  get right() {
    return this.x + this.width;
  }

  get bottom() {
    return this.y + this.height;
  }

  containsPoint(x, y) {
    return x >= this.x && x <= this.right && y >= this.y && y <= this.bottom;
  }

  addDoor(side, worldPosition, external = false) {
    this.doors.push({ side, position: worldPosition, external });
  }

  addBlocker(localX, localY, width, height, padding = 6) {
    this.blockers.push({
      x: this.x + localX - padding,
      y: this.y + localY - padding,
      width: width + padding * 2,
      height: height + padding * 2
    });
  }

  buildNavigation(nav) {
    const tx0 = Math.floor(this.x / TILE_SIZE);
    const ty0 = Math.floor(this.y / TILE_SIZE);
    const tx1 = Math.floor((this.right - 1) / TILE_SIZE);
    const ty1 = Math.floor((this.bottom - 1) / TILE_SIZE);

    for (let y = ty0 + 1; y <= ty1 - 1; y += 1) {
      for (let x = tx0 + 1; x <= tx1 - 1; x += 1) {
        nav.setWalkable(x, y, true);
      }
    }

    for (const door of this.doors) {
      if (door.side === "north" || door.side === "south") {
        const centerX = Math.floor(door.position / TILE_SIZE);
        const wallY = door.side === "north" ? ty0 : ty1;
        for (let offset = -1; offset <= 1; offset += 1) {
          nav.setWalkable(centerX + offset, wallY, true);
        }
      } else {
        const centerY = Math.floor(door.position / TILE_SIZE);
        const wallX = door.side === "west" ? tx0 : tx1;
        for (let offset = -1; offset <= 1; offset += 1) {
          nav.setWalkable(wallX, centerY + offset, true);
        }
      }
    }

    for (const blocker of this.blockers) {
      const start = nav.worldToCell(blocker.x, blocker.y);
      const end = nav.worldToCell(
        blocker.x + blocker.width,
        blocker.y + blocker.height
      );

      for (let y = start.y; y <= end.y; y += 1) {
        for (let x = start.x; x <= end.x; x += 1) {
          nav.setWalkable(x, y, false);
        }
      }
    }
  }

  draw(ctx, selected = false) {
    this.drawFloor(ctx);
    this.drawContents(ctx);
    this.drawWalls(ctx);
    this.drawLabel(ctx);

    if (selected) {
      ctx.save();
      ctx.strokeStyle = "rgba(88, 224, 218, .95)";
      ctx.lineWidth = 5;
      ctx.strokeRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);
      ctx.restore();
    }
  }

  drawFloor(ctx) {
    ctx.fillStyle = this.floorColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = "#526174";
    ctx.lineWidth = 1;

    for (let x = this.x; x <= this.right; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, this.y);
      ctx.lineTo(x, this.bottom);
      ctx.stroke();
    }

    for (let y = this.y; y <= this.bottom; y += 24) {
      ctx.beginPath();
      ctx.moveTo(this.x, y);
      ctx.lineTo(this.right, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  doorGapForSide(side) {
    const half = 30;
    return this.doors
      .filter(door => door.side === side)
      .map(door => ({
        start: door.position - half,
        end: door.position + half
      }))
      .sort((a, b) => a.start - b.start);
  }

  drawWallLine(ctx, side) {
    const thickness = 12;
    const gaps = this.doorGapForSide(side);

    if (side === "north" || side === "south") {
      const y = side === "north" ? this.y : this.bottom - thickness;
      let cursor = this.x;

      for (const gap of gaps) {
        const start = clamp(gap.start, this.x, this.right);
        const end = clamp(gap.end, this.x, this.right);

        if (start > cursor) {
          ctx.fillRect(cursor, y, start - cursor, thickness);
        }

        this.drawDoorThreshold(ctx, side, (start + end) / 2);
        cursor = Math.max(cursor, end);
      }

      if (cursor < this.right) {
        ctx.fillRect(cursor, y, this.right - cursor, thickness);
      }
    } else {
      const x = side === "west" ? this.x : this.right - thickness;
      let cursor = this.y;

      for (const gap of gaps) {
        const start = clamp(gap.start, this.y, this.bottom);
        const end = clamp(gap.end, this.y, this.bottom);

        if (start > cursor) {
          ctx.fillRect(x, cursor, thickness, start - cursor);
        }

        this.drawDoorThreshold(ctx, side, (start + end) / 2);
        cursor = Math.max(cursor, end);
      }

      if (cursor < this.bottom) {
        ctx.fillRect(x, cursor, thickness, this.bottom - cursor);
      }
    }
  }

  drawWalls(ctx) {
    ctx.save();
    ctx.fillStyle = this.wallColor;
    this.drawWallLine(ctx, "north");
    this.drawWallLine(ctx, "east");
    this.drawWallLine(ctx, "south");
    this.drawWallLine(ctx, "west");
    ctx.restore();
  }

  drawDoorThreshold(ctx, side, position) {
    ctx.save();
    ctx.fillStyle = "#8db7ca";

    if (side === "north" || side === "south") {
      const y = side === "north" ? this.y + 2 : this.bottom - 8;
      ctx.fillRect(position - 28, y, 56, 6);
    } else {
      const x = side === "west" ? this.x + 2 : this.right - 8;
      ctx.fillRect(x, position - 28, 6, 56);
    }

    ctx.restore();
  }

  drawLabel(ctx) {
    ctx.save();
    ctx.font = "800 12px Inter, system-ui, sans-serif";
    const text = this.name.toUpperCase();
    const width = ctx.measureText(text).width + 18;

    fillRoundedRect(
      ctx,
      this.x + 16,
      this.y + 16,
      width,
      28,
      8,
      "rgba(10, 27, 44, .9)"
    );

    ctx.fillStyle = "#e8f5ff";
    ctx.fillText(text, this.x + 25, this.y + 35);
    ctx.restore();
  }

  drawDesk(ctx, x, y, width, height, monitorCount = 1) {
    fillRoundedRect(ctx, x, y, width, height, 9, "#a66f43", "#172638", 3);

    for (let index = 0; index < monitorCount; index += 1) {
      const monitorWidth = Math.min(46, (width - 18) / monitorCount - 6);
      const mx = x + 10 + index * ((width - 20) / monitorCount);
      fillRoundedRect(
        ctx,
        mx,
        y + 9,
        monitorWidth,
        Math.min(28, height - 18),
        4,
        "#2f98d0",
        "#162536",
        3
      );
    }
  }

  drawChair(ctx, x, y, rotation = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    fillRoundedRect(ctx, -12, -14, 24, 28, 7, "#26394b", "#162536", 2);
    ctx.restore();
  }

  drawPlant(ctx, x, y, radius = 15) {
    ctx.save();
    ctx.fillStyle = "#4ca86b";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#173146";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  drawContents() {
    // Implemented by subclasses.
  }
}
