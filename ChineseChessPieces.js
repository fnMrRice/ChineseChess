class ChineseChessPiece extends Piece {
    constructor(Text, Position, Color) {
        super(Position);
        this.Text = Text;
        this.Color = Color || "red";
    }

    Draw(context) {
        const { Position, CoordinateTransform, Color, } = this;
        this.Shapes = [];
        if (this.Selected) {
            this.AddShape(new Circle(CoordinateTransform(Position), 25, Color, Color));
        } else if (this.MouseHere) {
            this.AddShape(new Circle(CoordinateTransform(Position), 25, Color, "rgb(237, 209, 132)"));
        } else {
            this.AddShape(new Circle(CoordinateTransform(Position), 25, Color, "rgb(239, 188, 84)"));
        }
        if (this.MouseHere) {
            this.AddShape(new Circle(CoordinateTransform(Position), 20, Color, "rgb(237, 209, 132)"));
        } else {
            this.AddShape(new Circle(CoordinateTransform(Position), 20, Color, "rgb(239, 188, 84)"));
        }
        this.AddShape(new Text(CoordinateTransform(Position), this.Text, "normal bold 34px 楷体", Color));
        super.Draw(context);
    }

    CoordinateTransform(FakePosition) {
        const { x, y } = FakePosition;
        return { x: x * 60 - 30, y: y * 60 - 30 };
    }

    PointInPiece(Position) {
        const { x, y, } = this.CoordinateTransform(this.Position);
        const dx = (Position.x - x);
        const dy = (Position.y - y);
        const sq = dx * dx + dy * dy;
        return sq < 25 * 25;
    }

    __check_target_color(Target) {
        const { x: new_x, y: new_y } = Target;
        for (let i = 0; i < this.Board.Pieces.length; i++) { // Check if target is same color
            const { Color, } = this.Board.Pieces[i];
            const { x: px, y: py, } = this.Board.Pieces[i].Position;
            if (px === new_x && py === new_y)
                if (Color === this.Color) return false;
                else return this.Board.Pieces[i];
        }
        return true;
    }

    __check_in_mid_9(Target) {
        const { x: new_x, y: new_y } = Target;
        if (new_x < 4 || 6 < new_x) return false; // Limit scope
        if (this.Color === "black") { // Limit scope
            if (new_y < 1 || 3 < new_y) return false;
        } else {
            if (new_y < 8 || 10 < new_y) return false;
        }
        return true;
    }

    __check_in_board(Target) {
        const { x: new_x, y: new_y } = Target;
        if (new_x < 1 || 9 < new_x) return false;
        if (new_y < 1 || 10 < new_y) return false;
        return true;
    }

    __check_piece_in_route(Target) {
        const { x, y } = this.Position;
        const { x: new_x, y: new_y } = Target;
        const is_x = (new_y - y) === 0;
        const r_begin = is_x ? x < new_x ? x + 1 : new_x + 1 : y < new_y ? y + 1 : new_y + 1;
        const r_end = is_x ? x < new_x ? new_x : x : y < new_y ? new_y : y;
        // console.log('r_begin', r_begin, 'r_end', r_end, 'is_x', is_x);
        let conuter = 0;
        for (let i = 0; i < this.Board.Pieces.length; i++) {
            const { x: px, y: py, } = this.Board.Pieces[i].Position;
            for (let nv = r_begin; nv < r_end; nv++) {
                if (is_x && px === nv && py === y) conuter += 1;
                if (!is_x && px === x && py === nv) conuter += 1;
            }
        }
        return conuter;
    }

    __check_move_straight(Target) {
        const { x, y } = this.Position;
        const { x: new_x, y: new_y } = Target;
        if (new_y - y !== 0 && new_x - x !== 0) return false; // Limit move direction
        return true;
    }
}

class ChineseChessPiece_SHUAI extends ChineseChessPiece {
    constructor(Color, Position) {
        super(Color === "red" ? "帥" : "將", Position, Color)
    }

    CheckNextPosition(Position) {
        const { x, y } = this.Position;
        const { x: new_x, y: new_y } = Position;

        if (!this.__check_in_mid_9(Position)) return false;
        // if (!this.__check_target_color(Position)) return false;

        if (new_x - x !== 0 && new_y - y !== 0) return false; // Limit move direction

        if (Math.abs(new_x - x) + Math.abs(new_y - y) > 1) return false; // Limit move step

        const target = this.__check_target_color(Position);
        if (!target) return false;
        if (target instanceof ChineseChessPiece) this.__eat(target);
        return true;
    }
}

class ChineseChessPiece_SHI extends ChineseChessPiece {
    constructor(Color, Position) {
        super(Color === "red" ? "仕" : "士", Position, Color)
    }

    CheckNextPosition(Position) {
        const { x, y } = this.Position;
        const { x: new_x, y: new_y } = Position;

        if (!this.__check_in_mid_9(Position)) return false;

        if (Math.abs(new_x - x) !== 1 || Math.abs(new_y - y) !== 1) return false; // Limit move step and direction

        const target = this.__check_target_color(Position);
        if (!target) return false;
        if (target instanceof ChineseChessPiece) this.__eat(target);
        return true;
    }
}

class ChineseChessPiece_XIANG extends ChineseChessPiece {
    constructor(Color, Position) {
        super(Color === "red" ? "相" : "象", Position, Color)
    }

    __check_move_scope_xiang(Target) {
        // console.log("xiang:__check_move_scope_xiang")
        const { x: new_x, y: new_y } = Target;
        if (new_x < 1 || 9 < new_x) return false; // Limit scope
        if (this.Color === "black") { // Limit scope
            if (new_y < 1 || 5 < new_y) return false;
        } else {
            if (new_y < 6 || 10 < new_y) return false;
        }
        return true;
    }

    __check_move_position(Target) {
        // console.log("xiang:__check_move_position")
        const { x, y } = this.Position;
        const { x: new_x, y: new_y } = Target;
        if (Math.abs(new_x - x) !== 2 || Math.abs(new_y - y) !== 2) return false;

        for (let i = 0; i < this.Board.Pieces.length; i++) { // Extra check
            const { x: px, y: py } = this.Board.Pieces[i].Position;
            const cx = (x + new_x) / 2;
            const cy = (y + new_y) / 2;
            if (px === cx && py === cy) return false;
        }
        return true;
    }

    CheckNextPosition(Position) {
        const { x, y } = this.Position;
        const { x: new_x, y: new_y } = Position;

        if (!this.__check_move_scope_xiang(Position)) return false;
        // if (!this.__check_target_color(Position)) return false;
        if (!this.__check_move_position(Position)) return false;

        const target = this.__check_target_color(Position);
        if (!target) return false;
        if (target instanceof ChineseChessPiece) this.__eat(target);
        return true;
    }
}

class ChineseChessPiece_JU extends ChineseChessPiece {
    constructor(Color, Position) {
        super(Color === "red" ? "俥" : "車", Position, Color)
    }

    CheckNextPosition(Position) {
        const { x, y } = this.Position;
        const { x: new_x, y: new_y } = Position;

        if (!this.__check_in_board(Position)) return false;
        // if (!this.__check_target_color(Position)) return false;

        if (!this.__check_move_straight(Position)) return false;
        if (this.__check_piece_in_route(Position)) return false;

        const target = this.__check_target_color(Position);
        if (!target) return false;
        if (target instanceof ChineseChessPiece) this.__eat(target);
        return true;
    }
}

class ChineseChessPiece_MA extends ChineseChessPiece {
    constructor(Color, Position) {
        super(Color === "red" ? "傌" : "馬", Position, Color)
    }

    __check_move_ma(Target) {
        const { x, y } = this.Position;
        const { x: new_x, y: new_y } = Target;
        let cx = null, cy = null;
        if (Math.abs(new_x - x) === 2) { // Limit move position and step
            if (Math.abs(new_y - y) !== 1) return false;
            cx = (x + new_x) / 2;
            cy = y;
        } else if (Math.abs(new_y - y) === 2) {
            if (Math.abs(new_x - x) !== 1) return false;
            cx = x;
            cy = (y + new_y) / 2;
        } else return false;

        for (let i = 0; i < this.Board.Pieces.length; i++) { // Extra check
            const { x: px, y: py } = this.Board.Pieces[i].Position;
            if (px === cx && py === cy) return false;
        }
        return true;
    }

    CheckNextPosition(Position) {
        if (!this.__check_in_board(Position)) return false;
        // if (!this.__check_target_color(Position)) return false;
        if (!this.__check_move_ma(Position)) return false;

        const target = this.__check_target_color(Position);
        if (!target) return false;
        if (target instanceof ChineseChessPiece) this.__eat(target);
        return true;
    }
}

class ChineseChessPiece_PAO extends ChineseChessPiece {
    constructor(Color, Position) {
        super(Color === "red" ? "炮" : "砲", Position, Color)
    }

    CheckNextPosition(Position) {
        const { x, y } = this.Position;
        const { x: new_x, y: new_y } = Position;

        if (!this.__check_in_board(Position)) return false;
        if (!this.__check_move_straight(Position)) return false;

        const target = this.__check_target_color(Position);
        const route_count = this.__check_piece_in_route(Position);
        if (route_count > 1) return false;
        if (route_count === 1) {
            if (target instanceof ChineseChessPiece) {
                this.__eat(target);
                return true;
            } else { return false; }
        }
        if (route_count === 0) return target === true;

        return true;
    }
}

class ChineseChessPiece_ZU extends ChineseChessPiece {
    constructor(Color, Position) {
        super(Color === "red" ? "兵" : "卒", Position, Color)
    }

    __check_before_pass_river(Target) {
        const { x, y } = this.Position;
        const { x: new_x, y: new_y } = Target;
        if (this.Color === "black" && y <= 5 && (new_x - x) !== 0) return false;
        if (this.Color === "red" && y >= 6 && (new_x - x) !== 0) return false;
        return true;
    }

    __check_after_pass_river(Target) {
        const { x, y } = this.Position;
        const { x: new_x, y: new_y } = Target;
        if (this.Color === "black") { // Limit move
            if (new_y - y < 0) return false; // Avoid move backwords
            if (Math.abs(new_x - x) + (new_y - y) > 1) return false; // Limit move direction and step
        } else {
            if (y - new_y < 0) return false;
            if (Math.abs(new_x - x) + (y - new_y) > 1) return false;
        }
        return true;
    }

    CheckNextPosition(Position) {
        if (!this.__check_in_board(Position)) return false;
        // if (!this.__check_target_color(Position)) return false;
        if (!this.__check_before_pass_river(Position)) return false;
        if (!this.__check_after_pass_river(Position)) return false;

        const target = this.__check_target_color(Position);
        if (!target) return false;
        if (target instanceof ChineseChessPiece) this.__eat(target);
        return true;
    }
}