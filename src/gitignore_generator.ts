export function CreateGitignoreContent(additionItems: string[]):string {

    return `# Ignore everything in the build directory
build
${additionItems.join('\n')}
`;
}
