import AcarsService from "../common/AcarsService.mjs";
import { cloneObjectSafe } from "../common/utils.mjs";
import BoxSelect from "./BoxSelect";
import PreviewText from "./PreviewText";

const createValueMap = (key, fields) => {
  if (AcarsService.formCacheEntry(key)) return AcarsService.formCacheEntry(key);
  const map = {};
  for (const row of fields) {
    if (row === null) continue;
    for (const field of row) {
      map[field.key] =
        typeof field.defaultValue === "function"
          ? field.defaultValue()
          : field.defaultValue !== undefined
            ? field.defaultValue
            : "";
    }
  }
  return map;
};
const isValid = (fields, values) => {
  if (
    typeof AcarsService.centerState.active !== "string" ||
    AcarsService.centerState.active.length === 0
  )
    return false;
  for (const row of fields) {
    if (row === null) continue;
    for (const field of row) {
      if (field.type === "subPageResolver") {
        const v = values[field.resolveKey];
        if (field.pages && field.pages[v]) {
          if (!isValid(field.pages[v], values))
            return false;
        }
      } else {
        if (
          field.regex &&
          (values[field.key] || "").match(field.regex) === null
        )
          return false;
      }
    }
  }
  return true;
};
const FormPage = ({
  fields,
  title,
  formKey,
  yOffset = 60,
  dryRunFunc,
  onSubmit,
  onCancel,
}) => {
  const { Button, TextField, Line, OffsetBox, DropdownSelect } = ui;
  const [fieldValues, setFieldValues] = reactUtils.useState(
    createValueMap(formKey, fields),
  );
  const [valid, setValid] = reactUtils.useState(isValid(fields, fieldValues));
  const [preview, setPreview] = reactUtils.useState(false);
  reactUtils.useEffect(() => {
    setValid(isValid(fields, fieldValues));
  }, [fieldValues, setValid, fields]);
  reactUtils.useEffect(() => {
    setFieldValues(createValueMap(formKey, fields));
    setPreview(false);
  }, [formKey, setPreview]);
  const renderField = (field, x, yi) => {
    const ybase = 240;
    let out = null;
    if (field.type === "dselect")
      out = (
        <OffsetBox x={x} y={ybase + yOffset * yi} key={field.key}>
          <text className="LabelText Gray" x={0} y={0}>
            {field.title}
          </text>

          <DropdownSelect
            x={field.inline ? field.xOffset : 0}
            y={field.inline ? -30 : 25}
            width={250}
            value={fieldValues[field.key]}
            options={field.options}
            onSelect={(v) => {
              const c = cloneObjectSafe(fieldValues);
              c[field.key] = v === null ? "none" : v;

              if (field.pages && field.pages[v]) {
                for (const row of field.pages[v]) {
                  for (const sf of row) {
                    if (sf.key) {
                      if (sf.defaultValue) {
                        c[sf.key] =
                          typeof sf.defaultValue === "function"
                            ? sf.defaultValue()
                            : sf.defaultValue;
                      } else {
                        c[sf.key] = "";
                      }
                    }
                  }
                }
              }
              setFieldValues(c);
              setPreview(false);
              setValid(isValid(fields, c));
              AcarsService.setFormCache(formKey, c);
            }}
          />
        </OffsetBox>
      );
    if (field.type === "select")
      out = (
        <OffsetBox x={x} y={ybase + yOffset * yi} key={field.key}>
          <text className="LabelText Gray" x={0} y={0}>
            {field.title}
          </text>

          <BoxSelect
            x={0}
            y={25}
            value={fieldValues[field.key]}
            options={field.options}
            onSelect={(v) => {
              const c = cloneObjectSafe(fieldValues);
              c[field.key] = v === null ? "none" : v;
              setFieldValues(c);
              AcarsService.setFormCache(formKey, c);
            }}
          />
        </OffsetBox>
      );
    if (field.type === "default") {
      out = (
        <OffsetBox x={x} y={ybase + yOffset * yi} key={field.key}>
          <text className="LabelText Gray" x={0} y={0}>
            {field.title}
          </text>
          <TextField
            width={field.width}
            size={field.size || 8}
            regex={field.regex || /[A-Z0-9]/}
            x={field.inline ? field.xOffset : 0}
            y={field.inline ? -25 : 25}
            value={fieldValues[field.key]}
            onDelete={() => {
              const c = cloneObjectSafe(fieldValues);
              c[field.key] = null;
              setFieldValues(c);
              AcarsService.setFormCache(formKey, c);
            }}
            onSubmit={(v) => {
              const c = cloneObjectSafe(fieldValues);
              c[field.key] = field.alter ? field.alter(v) : v;
              setFieldValues(c);
              AcarsService.setFormCache(formKey, c);
            }}
          />
        </OffsetBox>
      );
    }
    if (field.type === "freetext") {
      out = (
        <OffsetBox x={x} y={ybase + yOffset * yi} key={field.key}>
          <text className="LabelText Gray" x={0} y={0}>
            {field.title}
          </text>
          {Array(field.rows || 4)
            .fill()
            .map((_, i) => (
              <TextField
                key={i}
                width={field.width}
                size={field.size || 8}
                x={0}
                y={25 + i * 40}
                value={fieldValues[field.key + i]}
                onDelete={() => {
                  const c = cloneObjectSafe(fieldValues);
                  c[field.key + i] = null;
                  setFieldValues(c);
                  AcarsService.setFormCache(formKey, c);
                }}
                onSubmit={(v) => {
                  const c = cloneObjectSafe(fieldValues);
                  c[field.key + i] = v;
                  setFieldValues(c);
                  AcarsService.setFormCache(formKey, c);
                }}
              />
            ))}
        </OffsetBox>
      );
    }
    return out;
  };
  return (
    <>
      <text className="ContentText White" x={10} y={155}>
        {title}
      </text>

      {fields.map((row, yi) => {
        let x = 10;

        if (row === null) return null;

        if (row.length === 1 && row[0].type === "subPageResolver") {
          const resolverKey = row[0].resolveKey;
          const selected = fieldValues[resolverKey];
          const selectedPage = row[0].pages[selected];
          if (!selectedPage) return null;
          const arr = [];
          let sy = 0;
          for (const pr of selectedPage) {
            x = 10;
            for (const field of pr) {
              const out = renderField(field, x, yi + sy);
              x += field.width + 20;
              arr.push(out);
            }
            sy += 1;
          }
          return arr;
        }

        return row.map((field) => {
          const out = renderField(field, x, yi);
          x += field.width + 20;
          return out;
        });
      })}
      <Button
        x={10}
        y={710}
        width={120}
        onClick={() => {
          setPreview(false);
        }}
      >
        CLEAR
      </Button>
      <Button
        disabled={!valid}
        x={610}
        y={710}
        width={120}
        onClick={() => {
          setPreview(true);
        }}
      >
        SET
      </Button>
      <Line x1={10} y1={760} y2={760} x2={725} />
      {preview && valid ? (
        <PreviewText
          x={10}
          y={790}
          valid={valid}
          dryRunFunc={dryRunFunc}
          fieldValues={fieldValues}
        />
      ) : null}
      <Button
        x={10}
        y={1000}
        width={120}
        onClick={() => {
          onCancel();
        }}
      >
        CANCEL
      </Button>
      <Button
        disabled={!valid || !preview}
        x={610}
        y={1000}
        width={120}
        onClick={() => {
          onSubmit(fieldValues);
        }}
      >
        SEND
      </Button>
    </>
  );
};
export default FormPage;
