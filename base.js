class Size {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Shape {
    constructor(LineColor, FillColor) {
        this.LineColor = LineColor || "black";
        this.FillColor = FillColor || "transparent";
    }

    Move(Position) { throw ReferenceError('Shape:Move(Position): This method cannot be called'); }
    Draw(context) { throw ReferenceError('Shape:Draw(context): This method cannot be called'); }
}

class Line extends Shape {
    constructor(LineColor, Begin, End) {
        super(LineColor);
        this.Begin = Begin;
        this.End = End;
    }

    Move(Position) {
        const { x, y, } = Position;
        this.Begin.x += x;
        this.Begin.y += y;
        this.End.x += x;
        this.End.y += y;
    }

    Draw(context) {
        const { Begin, End, } = this;
        context.save();
        context.beginPath();
        context.strokeStyle = this.LineColor;
        context.fillStyle = this.LineColor;
        context.moveTo(Begin.x, Begin.y);
        context.lineTo(End.x, End.y);
        context.stroke();
        context.restore();
    }
}

class Circle extends Shape {
    constructor(Center, Radius, BorderColor, FillColor) {
        super(BorderColor || "transparent", FillColor || "black");
        this.Center = Center;
        this.Radius = Radius;
    }

    Move(Position) {
        const { x, y, } = Position;
        this.Center.x += x;
        this.Center.y += y;
    }

    Draw(context) {
        const { x, y } = this.Center;
        const { Radius } = this;
        context.save();
        context.beginPath();
        context.strokeStyle = this.LineColor;
        context.fillStyle = this.FillColor;
        context.arc(x, y, Radius, 0, 2 * Math.PI);
        context.fill();
        context.stroke();
        context.restore();
    }
}

class Text extends Shape {
    constructor(Center, Text, Font, TextColor) {
        super(TextColor, TextColor);
        this.Center = Center;
        this.Font = Font;
        this.Text = Text;
    }

    Move(Position) {
        const { x, y, } = Position;
        this.Center.x += x;
        this.Center.y += y;
    }

    Draw(context) {
        const { x, y } = this.Center;
        context.save();
        context.beginPath();
        context.font = this.Font;
        context.fillStyle = this.FillColor;
        context.textBaseline = "middle";
        context.textAlign = "center";
        context.fillText(this.Text, x, y);
        context.restore();
    }
}

class Grid {
    constructor(GridCount, StartAt) {
        this.GridCount = GridCount;
        this.StartAt = StartAt || { x: 1, y: 1 };
        this.Board = null;
    }

    __line(context, xs, ys, xe, ye) {
        const { x: x1, y: y1 } = this.Board.CoordinateTransform({ x: xs, y: ys });
        const { x: x2, y: y2 } = this.Board.CoordinateTransform({ x: xe, y: ye });
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
    }

    Draw(context, LineColor) {
        const { GridCount, StartAt, } = this;
        context.save();
        context.beginPath();
        context.fillStyle = LineColor || "#000000";
        context.strokeStyle = LineColor || "#000000";
        for (let i = 0; i <= this.GridCount.x; i++) {
            this.__line(context, StartAt.x + i, StartAt.y, StartAt.x + i, StartAt.y + GridCount.y)
        }
        for (let i = 0; i <= this.GridCount.y; i++) {
            this.__line(context, StartAt.x, StartAt.y + i, StartAt.x + GridCount.x, StartAt.y + i)
        }
        context.stroke();
        context.restore();
    }

    PositionInfo(Position) {
        const { GridCount, StartAt, } = this;
        const StartAtPos = this.Board.CoordinateTransform(StartAt);
        const { GridSize, } = this.Board;
        const result = { grid: { x: null, y: null, }, cross: { x: null, y: null, }, };
        let { x, y, } = Position;
        // console.log('Position: ', Position);
        x -= StartAtPos.x;
        y -= StartAtPos.y;
        result.grid.x = Math.floor(x / GridSize.x) + 1;
        result.grid.y = Math.floor(y / GridSize.y) + 1;
        if (result.grid.x > GridCount.x || result.grid.y > GridCount.y) { result.grid = null; }
        else if (result.grid.x <= 0 || result.grid.y <= 0) { result.grid = null; }
        else {
            result.grid.x += StartAt.x - 1;
            result.grid.y += StartAt.y - 1;
        }
        // console.log(GridSize);
        x += GridSize.x / 2;
        y += GridSize.y / 2;
        result.cross.x = Math.floor(x / GridSize.x) + 1;
        result.cross.y = Math.floor(y / GridSize.y) + 1;
        if (result.cross.x > GridCount.x + 1 || result.cross.y > GridCount.y + 1) { result.cross = null; }
        else if (result.cross.x <= 0 || result.cross.y <= 0) { result.cross = null; }
        else {
            result.cross.x += StartAt.x - 1;
            result.cross.y += StartAt.y - 1;
        }
        // console.log(result);
        return result;
    }
}

class Piece {
    constructor(Position) {
        this.Shapes = [];
        this.Position = Position;
        this.Board = null;
        this.MouseHere = false;
        this.Selected = false;
    }

    OnSelect(context) {
        this.Selected = true;
        this.Draw(context);
    }

    OnUnselect(context) {
        this.Selected = false;
        this.Draw(context);
    }

    OnMouseEnter(context) {
        this.MouseHere = true;
        this.Draw(context);
    }

    OnMouseLeave(context) {
        this.MouseHere = false;
        this.Draw(context);
    }

    AddShape(Shape) {
        this.Shapes.push(Shape);
    }

    Draw(context) {
        this.Shapes.forEach(element => {
            element.Draw(context);
        });
    }

    Move(Offset) {
        const { x, y } = this.Position;
        if (this.CheckNextPosition && !this.CheckNextPosition({ x: x + Offset.x, y: y + Offset.y })) {
            return false;
        }
        this.Shapes.forEach(element => {
            let RealOffset = Offset;
            if (this.CoordinateTransform) RealOffset = this.CoordinateTransform(Offset);
            element.Move(RealOffset);
        });
        this.Position.x += Offset.x;
        this.Position.y += Offset.y;
        // console.log("Move;");
        return true;
    }

    MoveTo(Position) {
        const { x, y } = this.Position;
        return this.Move({ x: Position.x - x, y: Position.y - y });
    }

    PointInPiece(Position) { throw ReferenceError('Piece:PointInPiece(Position): This method cannot be called'); }

    __eat(Piece) {
        const Pieces = this.Board.Pieces;
        Pieces.splice(Pieces.indexOf(Piece), 1);
    }
}

class Board {
    constructor(PiecePosition, GirdSize) {
        this.Grids = [];
        this.Pieces = [];
        this.Winner = null;
        this.GridSize = GirdSize;
        this.PiecePosition = PiecePosition || "cross"; // 棋子放在格子(grid)中或者放在交叉点(cross)
    }

    AddPiece(...Pieces) {
        const contact = elem => [].concat(...elem.map(v => Array.isArray(v) ? contact(v) : v));
        contact(Pieces).forEach(element => {
            element.Board = this;
            this.Pieces.push(element)
        });
        return this;
    }

    AddGrid(...Grids) {
        const contact = elem => [].concat(...elem.map(v => Array.isArray(v) ? contact(v) : v));
        contact(Grids).forEach(element => {
            element.Board = this;
            this.Grids.push(element)
        });
        return this;
    }

    Draw(context) {
        this.Grids.forEach(element => {
            element.Draw(context, this.LineColor);
        });
        if (this.DrawExtra) this.DrawExtra(context);
        this.Pieces.forEach(element => {
            element.Draw(context);
        })
    }

    GetPiece(Position) {
        const result = { x: 0, y: 0, };
        if (this.PiecePosition.toLowerCase() == "grid") {
            this.Grids.forEach((elem) => {
                const info = elem.PositionInfo(Position)
                if (info.grid != null) {
                    result.x = info.grid.x;
                    result.y = info.grid.y;
                }
            });
        } else if (this.PiecePosition.toLowerCase() == "cross") {
            this.Grids.forEach((elem) => {
                const info = elem.PositionInfo(Position)
                if (info.cross != null) {
                    result.x = info.cross.x;
                    result.y = info.cross.y;
                }
            });
        }
        for (let i = 0; i < this.Pieces.length; i++) {
            if (this.Pieces[i].Position.x === result.x && this.Pieces[i].Position.y === result.y && this.Pieces[i].PointInPiece(Position))
                return { piece: this.Pieces[i], position: result };
        }
        // console.log('result',result);
        return { piece: null, position: result };
    }
}
