// Lets prototypes import their CSS as a raw string for runtime injection,
// e.g. `import css from "./styles.css?raw"`.
declare module "*.css?raw" {
  const content: string;
  export default content;
}
