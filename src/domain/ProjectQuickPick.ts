import { QuickPickItem } from 'vscode';

export default class ProjectQuickPick implements QuickPickItem {
    label: string = '';
    description?: string | undefined;
    detail?: string | undefined;
    picked?: boolean | undefined;
    alwaysShow?: boolean | undefined;
    directory: string = '';
}