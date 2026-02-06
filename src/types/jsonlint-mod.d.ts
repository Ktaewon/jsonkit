declare module 'jsonlint-mod' {
  const jsonlint: {
    parse: (input: string) => unknown;
  };
  export default jsonlint;
}
