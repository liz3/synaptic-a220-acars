
const PreviewText = ({ fieldValues, dryRunFunc, x, y, valid }) => {
  const { OffsetBox } = ui;
  const [blocks, setBlocks] = reactUtils.useState([]);
  reactUtils.useEffect(() => {
    if (!valid) {
      setBlocks([]);
      return;
    }
    dryRunFunc(fieldValues).then(raw => {
      if (raw === null) {
        setBlocks([]);
        return;
      }
    
      const textList = [];
      let current = [];
      const mwl = 45;
      for (const word of raw.split(" ")) {
        current.push(word);
        const j = current.join(" ");
        if (j.length > mwl) {
          const l = current.pop();
          if (current.length)
            textList.push(current.join(" "));
          if (l.length >= mwl) {
            textList.push(l);
            current = [];
          } else { 
            current = [l];
          }
        }
      }
      textList.push(current.join(" "))
  
      setBlocks(textList);
    })

  }, [fieldValues, dryRunFunc, valid, setBlocks])
  if (!valid)
    return null;
  return <OffsetBox x={x} y={y}>
    {blocks.map((content, i) => <text key={i} className="ContentText White" x={0} y={(i * 25)}>{content}</text>)}
  </OffsetBox>
}
export default PreviewText;