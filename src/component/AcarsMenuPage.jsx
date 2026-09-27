import AcarsService from "../common/AcarsService.mjs";

const AcarsMenuPage = ({ arg, onSubmit, latest, onLatest }) => {
  const { Button } = ui;
  const title = arg.title;
  const grid = arg.grid;
  // const { title, grid } = arg;

  const btnPressed = (s, r) => {
    if (s === "l" && r === 5) {
      const p = grid[`close`];
      if (p) {
        const [key, arg] = p.cb();
        onSubmit(key, arg);
      }
      return;
    }
    if (s === "r" && r === 5) {
      if (latest) {
        onLatest();
      }
      return;
    }
    const p = grid[`${s}-${r}`];
    if (p) {
      const [key, arg] = p.cb();
      onSubmit(key, arg);
    }
  };
  if (!grid)
    return null;
  return (
    <>
      <Button x={500} y={200} width={70} disabled={true} onClick={() => {}}>
        PREV
      </Button>
      <Button x={575} y={200} width={75} disabled={true} onClick={() => {}}>
        NEXT
      </Button>
      {Array(6)
        .fill()
        .map((_, i) => {
          return (
            <Button
              key={i}
              x={80}
              y={335 + i * 100}
              width={90}
              onClick={() => {
                btnPressed("l", i);
              }}
            ></Button>
          );
        })}
      {Array(6)
        .fill()
        .map((_, i) => {
          return (
            <Button
              key={i}
              x={610}
              y={335 + i * 100}
              width={90}
              onClick={() => {
                btnPressed("r", i);
              }}
            ></Button>
          );
        })}
      <text className="ContentText White" x={240} y={290}>
        {title}
      </text>
      {grid.close ? (
        <text className="ContentText White" x={210} y={855}>{`<RETURN`}</text>
      ) : null}
      {latest ? (
        <text className="ContentText LightBlue" x={520 - (AcarsService.aocMessageStr(latest).length * 7.6)} y={855}>{`${AcarsService.aocMessageStr(latest)}*`}</text>
      ) : null}
      {Array(6)
        .fill()
        .map((_, i) => {
          const p = grid[`l-${i}`];
          if (!p) return null;

          return (
            <text
              key={i}
              className="ContentText White"
              x={200}
              y={370 + i * 100}
            >
              {"<"}
              {p.title}
            </text>
          );
        })}
      {Array(6)
        .fill()
        .map((_, i) => {
          const p = grid[`r-${i}`];
          if (!p) return null;

          return (
            <text
              key={i}
              className="ContentText White"
              x={515 - p.title.length * 7.6}
              y={370 + i * 100}
            >
              {p.title}
              {">"}
            </text>
          );
        })}
    </>
  );
};
export default AcarsMenuPage;
