const Main = (canvas, buttons) => {
    if (canvas.getContext) {
        canvas.width = 600;
        canvas.height = 700;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const board = new ChineseChessBoard();
        board.Draw(ctx);

        let lastSelect = null;
        const OnSelect = (e) => {
            if (e.button !== 0) return;
            const { piece, position, } = board.GetPiece({ x: e.offsetX, y: e.offsetY });
            if (!lastSelect) {
                if (piece) piece.OnSelect(ctx);
                lastSelect = piece;
                return;
            };
            // console.log(lastSelect);
            // lastSelect.OnUnselect(ctx);
            if (lastSelect.MoveTo(position)) {
                lastSelect.OnUnselect(ctx);
                lastSelect = null;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                board.Draw(ctx);
            }
        };

        let lastHover = null;
        const OnHover = (e) => {
            const { piece, } = board.GetPiece({ x: e.offsetX, y: e.offsetY });
            if (lastHover) lastHover.OnMouseLeave(ctx);
            if (piece) piece.OnMouseEnter(ctx);
            lastHover = piece;
        };
        const OnCancel = (e) => {
            e.preventDefault();
            // e.stopPropagation();
            if (lastSelect) {
                lastSelect.OnUnselect(ctx);
                lastSelect = null;
            }
        };

        canvas.addEventListener("mousedown", OnSelect);
        canvas.addEventListener("mousemove", OnHover);
        canvas.addEventListener("contextmenu", OnCancel);

        const { clear, } = buttons;
        const OnReset = e => {
            canvas.removeEventListener("mousedown", OnSelect);
            canvas.removeEventListener("mousemove", OnHover);
            canvas.removeEventListener("contextmenu", OnCancel);
            clear.removeEventListener("click", OnReset);
            Main(canvas, buttons);
        }
        clear.addEventListener("click", OnReset);
    } else {
        console.log("canvas do not supported.");
    }
}