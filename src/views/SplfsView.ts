
import { SortOptions } from '@halcyontech/vscode-ibmi-types/api/IBMiContent';
import vscode, { l10n, TreeDataProvider } from 'vscode';
import { IBMiContentSplf } from "../api/IBMiContentSplf";
import { getSpooledFileUri } from '../filesystem/qsys/SplfFs';
import { Code4i, getFilterConfigForServer } from '../tools';
import { IBMISplfList, IBMiSpooledFile, SplfOpenOptions, ObjAttributes, SpooledFileConfig } from '../typings';
import { IBMiContentCommon, sortObjectArrayByProperty } from "../api/IBMiContentCommon";


//https://code.visualstudio.com/api/references/icons-in-labels
const objectIcons: Record<string, string> = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '*outq': 'server',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '*usrprf': 'server',
  'splf': 'file',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '': 'circle-large-outline'
};

export default class SPLFBrowser implements TreeDataProvider<any> {
  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void>;
  public onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void>;
  private _splfFilters: IBMISplfList[] = [];

  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  // Method to set data when your extension becomes connected
  public populateData(newData: IBMISplfList[]): void {
    this._splfFilters = newData;
    // this._onDidChangeTreeData.fire(); // Notify VS Code to refresh
  }
  refresh(target?: any) {
    const config = Code4i.getConfig();
    const splfConfig = getFilterConfigForServer<SpooledFileConfig>('splfBrowser', config.name) || [];
    this.populateData(splfConfig);
    this._onDidChangeTreeData.fire(target);
  }

  // Method to clear the tree view
  public clearTree(oldData?: IBMISplfList): void {
    if (oldData) {
      const tempArray = this._splfFilters.filter(obj => obj.name !== oldData.name);
      this._splfFilters = tempArray;
    } else {
      this._splfFilters = []; // Clear the data
    }
    this._onDidChangeTreeData.fire(); // Notify VS Code to refresh
  }

  /**
   * @param {vscode.TreeItem} element
   * @returns {vscode.TreeItem};
   */
  getTreeItem(element: vscode.TreeItem) {
    return element;
  }

  /**
   * @param {vscode.TreeItem} element
   * @returns {Promise<vscode.TreeItem[]>};
   */
  async getChildren(element: any) {
    const items = [];
    const connection = Code4i.getConnection();
    if (connection) {

      if (element) {
        // let filter;
        switch (element.contextValue.split(`_`)[0]) {
        case `splflist`:
          //Fetch spooled files
          try {
            const splfs = await IBMiContentSplf.getSpooledFileFilter({ name: element.name, library: element.library, type: element.type } as IBMISplfList, element.sort, undefined, element.filter);
            items.push(...splfs
              .map((splf: IBMiSpooledFile) => new SpooledFiles(`splf`, element, splf)));
            element.setRecordCount(splfs.length);

          } catch (e: any) {
            // console.log(e);
            vscode.window.showErrorMessage(e.message);
            items.push(new vscode.TreeItem(l10n.t(`Error loading spooled files.`)));
          }
        case `splf`:
          { }
          break;
        }

      } else if (this._splfFilters && this._splfFilters.length > 0) { // no context exists in tree yet, get from settings if present
        const filtereditems: IBMISplfList[] = this._splfFilters.filter((item: any) => item === item);
        const distinctNames: string[] = [...new Set(filtereditems.map(item => item.name))];
        const objAttributes = await IBMiContentCommon.getObjectText(distinctNames, [], ['*USRPRF', '*OUTQ']);
        const splfQs: IBMISplfList[] = this._splfFilters.map((splfQ): IBMISplfList => ({
          ...splfQ,
          text: lookupItemText(splfQ, objAttributes),
        }));
        const mappedItems: SpooledFileFilter[] = splfQs.map((item) => new SpooledFileFilter(`splflist`, element, item, connection.currentUser));
        items.push(...mappedItems);
        // items.push(...this._splfFilters.map(
        //   (theFilter: IBMISplfList) => new SpooledFileFilter(`splflist`, element, theFilter, connection.currentUser)
        // ));
      }
    }
    return Promise.all(items);
  }
  /**
   * getParemt
   * required implementation for TreeDataProvider
   *
   */
  getParent(element: any) {
    return element.parent;
  }
  /**
   * Called on hover to resolve the {@link TreeItem.tooltip TreeItem} property if it is undefined.
   * Called on tree item click/open to resolve the {@link TreeItem.command TreeItem} property if it is undefined.
   * Only properties that were undefined can be resolved in `resolveTreeItem`.
   * Functionality may be expanded later to include being called to resolve other missing
   * properties on selection and/or on open.
   *
   * Will only ever be called once per TreeItem.
   *
   * onDidChangeTreeData should not be triggered from within resolveTreeItem.
   *
   * *Note* that this function is called when tree items are already showing in the UI.
   * Because of that, no property that changes the presentation (label, description, etc.)
   * can be changed.
   *
   * @param item Undefined properties of `item` should be set then `item` should be returned.
   * @param element The object associated with the TreeItem.
   * @param token A cancellation token.
   * @return The resolved tree item or a thenable that resolves to such. It is OK to return the given
   * `item`. When no result is returned, the given `item` will be used.
   * @param {vscode.TreeItem} item
   * @param {vscode.TreeDataProvider<T>} element
   * @param {vscode.CancellationToken} token
   * @returns {ProviderResult<vscode.TreeItem>};
   */
  async resolveTreeItem(item: SpooledFileFilter | SpooledFiles, element: any, token: vscode.CancellationToken): Promise<vscode.TreeItem> {
    const showDebugInfo = process.env.SHOW_DEBUG_INFO === 'true' || vscode.debug.activeDebugSession !== undefined;

    if (item instanceof SpooledFileFilter) {
      const splfNum = await IBMiContentSplf.getFilterSpooledFileCount({ name: item.name, library: item.library, type: item.type } as IBMISplfList
        , item.filter);
      const objAttributes = await IBMiContentCommon.getObjectText([item.name], [item.library], [item.type]) || '';
      // const splfFilterInfo = await IBMiContentSplf.getFilterDescription([item.name], item.library, item.type);
      item.setRecordCount(Number(splfNum.numberOf));
      item.itemText = objAttributes[0].text || ``;
      if (objAttributes[0].library && (item.library === '' || item.library === '*LIBL')) { item.library = objAttributes[0].library; }

      item.tooltip = new vscode.MarkdownString(`<table>`
        .concat(`<thead>${element.library}/${element.name}</thead><hr>`)
        .concat(`<tr><td>${l10n.t(`Text:`)} </td><td>&nbsp;${l10n.t(String(item.itemText))}</td></tr>`)
        .concat(`<tr><td>${l10n.t(`Spooled Files:`)} </td><td>&nbsp;${l10n.t(String(splfNum.numberOf))}</td></tr>`)
        .concat(`<tr><td>${l10n.t(`Sorting:`)} </td><td>&nbsp;${l10n.t(String(item.sortDescription))}</td></tr>`)
        .concat(`<tr><td>${l10n.t(`Filtering:`)} </td><td>&nbsp;${l10n.t(String(element.filter))}</td></tr>`)
        .concat(`</table>`)
      );
      item.tooltip.supportHtml = true;
    } else if (item instanceof SpooledFiles) {
      const info = await IBMiContentSplf.getSpooledFileDeviceType([item.queue], [item.queueLibrary], [item.name], [item.jobUser]
        , item.qualifiedJobName, item.number);
      const pageLength = await IBMiContentSplf.getSpooledPageLength([item.queue], [item.queueLibrary], [item.name], [item.jobUser]
        , item.qualifiedJobName, item.number);
      item.pageLength = pageLength[0].pageLength || '68';
      item.deviceType = info[0].deviceType || '*SCS';
      item.tooltip = new vscode.MarkdownString(`<table>`
        .concat(`<thead>${item.path.split(`/`)[2]}</thead><hr>`)
        .concat(`<tr><td style="text-align: right;">${l10n.t(`Job:`)}</td><td>&nbsp;${l10n.t(item.qualifiedJobName)}</td></tr>`)
        .concat(`<tr><td>${l10n.t(`File Number:`)}</td><td>&nbsp;${item.number}</td></tr>`)
        .concat(`<tr><td>${l10n.t(`UserData:`)}</td><td>&nbsp;${l10n.t(item.userData)}</td></tr>`)
        .concat(`<tr><td>${l10n.t(`Created:`)}</td><td>&nbsp;${l10n.t(item.creationTimestamp)}</td></tr>`)
        .concat(`<tr><td>${l10n.t(`Size in bytes:`)}</td><td>&nbsp;${item.size}</td></tr>`)
        .concat(`<tr><td>${l10n.t(`Page Length:`)}</td><td>&nbsp;${l10n.t(item.pageLength)}</td></tr>`)
        .concat(`<tr><td>${l10n.t(`Form Type:`)}</td><td>&nbsp;${l10n.t(item.formType)}</td></tr>`)
        .concat(`<tr><td>${l10n.t(`Output Queue:`)}</td><td>&nbsp;${l10n.t(item.queueLibrary), item.queue}</td></tr>`)
        .concat(`<tr><td>${l10n.t(`Device Type:`)}</td><td>&nbsp;${l10n.t(item.deviceType)}</td></tr>`)
        .concat(`<tr><td>${l10n.t(`Filtering:`)}</td><td>&nbsp;${l10n.t(String(item.parent.filter))}</td></tr>`)
      );
      console.log(`item.number == ${item.number}`);
      if (showDebugInfo) {
        item.tooltip = item.tooltip.appendMarkdown(``
          .concat(`<tr><td>${l10n.t(`path:`)}</td><td>&nbsp;${item.path}</td></tr>`)
          .concat(`<tr><td>${l10n.t(`Open Parms.readonly:`)}</td><td>&nbsp;${item.openQueryparms.readonly}</td></tr>`)
          .concat(`<tr><td>${l10n.t(`Open Parms.openMode:`)}</td><td>&nbsp;${item.openQueryparms.openMode}</td></tr>`)
          .concat(`<tr><td>${l10n.t(`Open Parms.position:`)}</td><td>&nbsp;${item.openQueryparms.position}</td></tr>`)
          .concat(`<tr><td>${l10n.t(`Open Parms.pageLength:`)}</td><td>&nbsp;${item.openQueryparms.pageLength}</td></tr>`)
          .concat(`<tr><td>${l10n.t(`Open Parms.fileExtension:`)}</td><td>&nbsp;${item.openQueryparms.fileExtension}</td></tr>`)
          .concat(`<tr><td>${l10n.t(`Open Parms.saveToPath:`)}</td><td>&nbsp;${item.openQueryparms.saveToPath}</td></tr>`)
          .concat(`<tr><td>${l10n.t(`Open Parms.tempPath:`)}</td><td>&nbsp;${item.openQueryparms.tempPath}</td></tr>`)
          .concat(`<tr><td>${l10n.t(`Open Parms.qualifiedJobName:`)}</td><td>&nbsp;${item.openQueryparms.qualifiedJobName}</td></tr>`)
          .concat(`<tr><td>${l10n.t(`Open Parms.spooledFileNumber:`)}</td><td>&nbsp;${item.openQueryparms.spooledFileNumber}</td></tr>`)
          .concat(`<tr><td>${l10n.t(`Open Parms.spooledFileName:`)}</td><td>&nbsp;${item.openQueryparms.spooledFileName}</td></tr>`)
        );
      }
      item.tooltip = item.tooltip.appendMarkdown(``
        .concat(`</table>`)
      );
      item.tooltip.supportHtml = true;
    }
    return item;
  }
}

export class SpooledFileFilter extends vscode.TreeItem {
  protected: boolean;
  path: string;
  parent: vscode.TreeItem;
  name: string;
  library: string;
  type: string;
  text: string;
  filter?: string; // reduces tree items to matching tokens
  itemText: string;
  numberOf: number | undefined;
  filterDescription?: string;
  sortDescription: string | undefined;
  readonly sort: SortOptions = { order: "date", ascending: true };
  constructor(contextType: string, parent: vscode.TreeItem, theFilter: IBMISplfList, currentUser: string) {
    super(theFilter.name, vscode.TreeItemCollapsibleState.Collapsed);
    this.name = theFilter.name;
    this.library = theFilter.library || `*LIBL`;
    this.type = theFilter.type;
    const icon = this.setIcon(`${this.type.toLocaleLowerCase()}`);
    this.protected = this.name.toLocaleUpperCase() !== currentUser.toLocaleUpperCase() ? true : false;
    this.contextValue = `${contextType}${this.protected ? `_readonly` : ``}`;
    this.path = theFilter.name;
    this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    this.parent = parent;
    this.iconPath = new vscode.ThemeIcon(icon, (this.protected ? new vscode.ThemeColor(`list.errorForeground`) : undefined));
    this.text = theFilter.text || '';
    this.setFilterDescription(this.filter);
    this.sortBy(this.sort);
    this.setDescription();
    
    
    this.filter = '';
    this.itemText = '';
  }
  setFilterDescription(value: string | undefined) { this.filterDescription = `${value?`Filtered by: ${value}`:''}`; }
  /** @type {import("../api/IBMiContent").SortOptions}*/
  sortBy(sort: SortOptions) {
    if (this.sort.order !== sort.order) {
      this.sort.order = sort.order;
      this.sort.ascending = true;
    }
    else {
      this.sort.ascending = !this.sort.ascending;
    }
    this.sortDescription = `( sort: ${this.sort.order} ${this.sort.ascending ? `🔺` : `🔻`})`;
  }
  setIcon(type: string): string { return objectIcons[type] || objectIcons[``]; }
  setFilter(filter: string | undefined) { this.filter = filter; }
  clearToolTip() { this.tooltip = undefined; }
  setRecordCount(amount: number) { this.numberOf = amount; }
  setDescription() {
    this.description =
      (this.text ? this.text : '')
      + (this.filterDescription ? ` ` + this.filterDescription : ``)
      + (this.sortDescription ? ` ` + this.sortDescription : '');
  }
}

export class SpooledFiles extends vscode.TreeItem implements IBMiSpooledFile {
  parent: SpooledFileFilter;
  type: string;
  name: string;
  number: string;
  status: string;
  creationTimestamp: string;
  userData: string;
  size: number;
  totalPages: number;
  pageLength: string;
  qualifiedJobName: string;
  jobName: string;
  jobUser: string;
  jobNumber: string;
  formType: string;
  queueLibrary: string;
  queue: string;
  protected: boolean;
  path: string;
  deviceType: string;
  openQueryparms: SplfOpenOptions;
  readonly sort: SortOptions = { order: "date", ascending: true };
  readonly sortBy: (sort: SortOptions) => void;
  /**
   * @param {"splf"} type
   * @param {vscode.TreeItem} parent
   * @param {IBMiSpooledFile} inp
   * @param {IBMiSplfUser} filter
   */
  constructor(type: string, parent: SpooledFileFilter, inp: IBMiSpooledFile) {

    const icon = objectIcons[`${type}`] || objectIcons[``];
    super(`${inp.name}.${type}`, vscode.TreeItemCollapsibleState.Collapsed);
    this.collapsibleState = vscode.TreeItemCollapsibleState.None;

    this.parent = parent;
    this.type = type;
    // Layout of IBMiSpooledFile
    this.name = inp.name;
    this.number = inp.number;
    this.status = inp.status || '';
    this.creationTimestamp = inp.creationTimestamp || '';
    this.userData = inp.userData || '';
    this.size = inp.size || 0;
    this.totalPages = inp.totalPages || 0;
    this.pageLength = inp.pageLength || '';
    this.qualifiedJobName = inp.qualifiedJobName;
    this.jobName = inp.jobName || '';
    this.jobUser = inp.jobUser || '';
    this.jobNumber = inp.jobNumber || '';
    this.formType = inp.formType || '';
    this.queueLibrary = inp.queueLibrary;
    this.queue = inp.queue;

    this.description = l10n.t(`- {0} - Pages: {1}, Time: {2} `, this.status, this.totalPages, this.creationTimestamp.substring(11));
    this.iconPath = new vscode.ThemeIcon(icon);
    this.protected = parent.protected;
    this.contextValue = `spooledfile2${this.protected ? `_readonly` : ``}`;
    this.deviceType = ``;

    this.iconPath = new vscode.ThemeIcon(icon, (this.protected ? new vscode.ThemeColor(`list.errorForeground`) : undefined));
    this.sortBy = (sort: SortOptions) => parent.sortBy(sort);
    this.openQueryparms = this.setOpenQueryparms(this);
    this.resourceUri = getSpooledFileUri(parent.type, inp, this.openQueryparms) || '';
    this.path = this.resourceUri.path.substring(1); // removes leading slash for QSYS paths
    this.command = {
      command: `vscode-ibmi-queues.splfbrowser2.openWithoutLineSpacing`,
      title: `Open Spooled File`,
      arguments: [this, undefined, this.openQueryparms]
    };
  }
  setOpenQueryparms(me: SpooledFiles): SplfOpenOptions {
    return {
      readonly: me.parent.protected,
      qualifiedJobName: me.qualifiedJobName,
      spooledFileNumber: me.number,
      spooledFileName: me.name,
    } as SplfOpenOptions
      ;
  }
}

function formatToolTip(label: string, obj: Record<string, any>): string {
  const md = Object.entries(obj)
    .map(([key, val]) => `<tr><td>${l10n.t(`${label}:`)}</td><td>&nbsp;${l10n.t(val)}</td></tr>`
    )
    .join()
    ;
  return md;
}
function lookupItemText(aFilter: IBMISplfList, objAttributes: ObjAttributes[]): string {
  // let index = 0;
  // let theText = '';
  // index = objAttributes.findIndex(oa => oa.name === aFilter.name && oa.type === aFilter.type);
  // if (index === -1) {
  //   index = objAttributes.findIndex(oa => oa.name === aFilter.name && aFilter.text);
  // }
  // if (index >= 0) {
  //   theText = objAttributes[index].text;
  // }
  // return theText;

  // 1. Primary Match: Name and Type
  let match = objAttributes.find(
    (attr) => attr.name === aFilter.name && attr.type === aFilter.type
  );

  // If match exists but text is null, reset match to look for fallback
  if (match && match.text === null) {
    match = undefined;
  }

  // 2. Fallback: Name only (where text is not null)
  if (!match) {
    match = objAttributes.find(
      (attr) => attr.name === aFilter.name && attr.text !== null
    );
  }

  return match?.text ?? '';
}