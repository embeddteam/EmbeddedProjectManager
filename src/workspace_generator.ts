export function CreateWorkspaceContent(settings_obj?:object)
{
    const workspace_data = {
        folders:[
            {
                path: "."
            }
        ],
        settings: settings_obj
    };

    return workspace_data;
}