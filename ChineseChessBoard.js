class ChineseChessBoard extends Board {
    constructor() {
        super("cross", { x: 60, y: 60 });
        this.AddGrid();
        this.AddPiece();
    }

    AddGrid(elems) {
        if (elems) super.AddGrid(elems);
        this.RedBoard = new Grid(new Size(8, 4), { x: 1, y: 1 });
        this.BlackBoard = new Grid(new Size(8, 4), { x: 1, y: 6 });
        super.AddGrid(this.RedBoard, this.BlackBoard);
    }

    AddPiece(elems) {
        if (elems) super.AddPiece(elems);
        const JIANG = new ChineseChessPiece_SHUAI("black", { x: 5, y: 1 });
        const SHUAI = new ChineseChessPiece_SHUAI("red", { x: 5, y: 10 });
        const END_LINE = [ChineseChessPiece_JU, ChineseChessPiece_MA,
            ChineseChessPiece_XIANG, ChineseChessPiece_SHI].map((Piece, index) => {
                return [
                    new Piece('red', { x: index + 1, y: 10 }),
                    new Piece('red', { x: 9 - index, y: 10 }),
                    new Piece('black', { x: index + 1, y: 1 }),
                    new Piece('black', { x: 9 - index, y: 1 }),
                ];
            });
        const PAO = [2, 8].map(num => {
            return [
                new ChineseChessPiece_PAO("red", { x: num, y: 8 }),
                new ChineseChessPiece_PAO("black", { x: num, y: 3 })
            ];
        });
        const ZU = [1, 3, 5, 7, 9].map((num) => {
            return [
                new ChineseChessPiece_ZU('red', { x: num, y: 7 }),
                new ChineseChessPiece_ZU('black', { x: num, y: 4 }),
            ];
        });

        super.AddPiece(JIANG); // 将
        super.AddPiece(SHUAI); // 帅
        super.AddPiece(...END_LINE); // 最后一行
        super.AddPiece(...PAO); // 炮
        super.AddPiece(...ZU); // 兵
    }

    __line(context, Begin, End, isFake) {
        // const { CoordinateTransform, } = this;
        const { x: x1, y: y1, } = isFake ? this.CoordinateTransform(Begin) : Begin;
        const { x: x2, y: y2, } = isFake ? this.CoordinateTransform(End) : End;
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
    }

    __mark(context, Position) {
        const { x, y, } = this.CoordinateTransform(Position);
        if (Position.x != 1 && Position.y != 1) { // left top
            this.__line(context, { x: x - 10, y: y - 5 }, { x: x - 5, y: y - 5 });
            this.__line(context, { x: x - 5, y: y - 10 }, { x: x - 5, y: y - 5 });
        }
        if (Position.x != 1 && Position.y != 10) { // left bottom
            this.__line(context, { x: x - 10, y: y + 5 }, { x: x - 5, y: y + 5 });
            this.__line(context, { x: x - 5, y: y + 10 }, { x: x - 5, y: y + 5 });
        }
        if (Position.x != 9 && Position.y != 1) { // right top
            this.__line(context, { x: x + 10, y: y - 5 }, { x: x + 5, y: y - 5 });
            this.__line(context, { x: x + 5, y: y - 10 }, { x: x + 5, y: y - 5 });
        }
        if (Position.x != 9 && Position.y != 10) {// right bottom
            this.__line(context, { x: x + 10, y: y + 5 }, { x: x + 5, y: y + 5 });
            this.__line(context, { x: x + 5, y: y + 10 }, { x: x + 5, y: y + 5 });
        }

    }

    DrawExtra(context) {
        context.save();
        // Draw extra lines
        context.beginPath();
        context.strokeStyle = "black";
        this.__line(context, new Size(1, 5), new Size(1, 6), true);
        this.__line(context, new Size(9, 5), new Size(9, 6), true);
        this.__line(context, new Size(4, 1), new Size(6, 3), true);
        this.__line(context, new Size(4, 3), new Size(6, 1), true);
        this.__line(context, new Size(4, 10), new Size(6, 8), true);
        this.__line(context, new Size(4, 8), new Size(6, 10), true);
        [1, 3, 5, 7, 9].forEach(n => {
            this.__mark(context, new Size(n, 4));
            this.__mark(context, new Size(n, 7));
        });
        this.__mark(context, new Size(2, 3));
        this.__mark(context, new Size(8, 3));
        this.__mark(context, new Size(2, 8));
        this.__mark(context, new Size(8, 8));
        context.stroke();
        // 绘制楚河汉界文字
        context.beginPath();
        const WORD_CHU = this.CoordinateTransform({ x: 1, y: 5.5 });
        context.translate(WORD_CHU.x, WORD_CHU.y);
        context.rotate(270 * Math.PI / 180);
        context.font = "normal bold 50px 楷体";
        context.fillStyle = "black";
        context.textBaseline = "middle";
        context.textAlign = "center";
        context.fillText("楚", 0, 1.5 * this.GridSize.x);
        context.fillText("河", 0, 2.5 * this.GridSize.x);
        context.rotate(180 * Math.PI / 180);
        context.fillText("漢", 0, -6.5 * this.GridSize.x);
        context.fillText("界", 0, -5.5 * this.GridSize.x);
        context.restore();
        // 绘制棋盘上数字
        context.save();
        context.font = "normal bold 16px 隶书";
        context.fillStyle = "black";
        context.textBaseline = "middle";
        context.textAlign = "center";
        [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((v, i) => {
            context.fillText(v.toString(), v * this.GridSize.x, 0.25 * this.GridSize.y);
            context.fillText("九八七六五四三二一".charAt(i), v * this.GridSize.x, 10.75 * this.GridSize.y);
        });
        context.restore();
    }

    CoordinateTransform(FakePosition) {
        const { x, y } = FakePosition;
        return { x: x * this.GridSize.x, y: y * this.GridSize.y };
    }
}
