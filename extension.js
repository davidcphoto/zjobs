// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const ProfileInfo = require("@zowe/imperative");
const GetJobs = require("@zowe/zos-jobs-for-zowe-sdk");
const zowe_explorer_api = require("@zowe/zowe-explorer-api");
let user = '';
let pref = '';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "zjobs" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('zjobs.Open', function (node = zowe_explorer_api.ZoweTreeNode) {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('zJobs!');
        OpenWebView(node.session);
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
    activate,
    deactivate
}

function OpenWebView(session) {

    // const submitIcon = `$(filter)`;
    const submitIcon = new vscode.ThemeIcon("filter");
    const SetaExpandir = '&#11208;';
    const SetaComprimir = '&#11206;';
    if (!pref && !user) {
        user = session.mISession.user;
    }
    const Job = '*';
    const JobID = '*';
    const Status = '*';
    const MaxRC = '*';
    const Class = '*';
    const SubmitData = '*';
    const EndData = '*';


    const linha = `            <a href="#"><tr>
                <td>${SetaExpandir}</td>
                <td>${Job}</td>
                <td>${JobID}</td>
                <td>${Status}</td>
                <td>${MaxRC}</td>
                <td>${Class}</td>
                <td>${SubmitData}</td>
                <td>${EndData}</td>
            </tr></a>
            <tr><td COLSPAN="8"></td></tr>`;

    let linhas = linha + linha;

    const HTML = `
<!DOCTYPE html>
<html>

<head>
    <meta charset='utf-8'>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>zJobs</title>
    <style>
        #filters {
            position: static;
            top: 0;
            margin: auto;
            width: 70%;
            text-align: center;
			padding: 10px;
        }

        #lista table {
            width: 100%;
            margin: auto;
            text-align: center;

        }

        .filtro {
            position: absolute;
            display: contents;
        }

        #job {
            display: none;
        }

		.tr:nth-child(even) {
            background-color: var(--vscode-textSeparator-foreground);
        }

        .tr:hover {
            background-color: var(--vscode-editorActionList-focusBackground);
        }

        th {
            background-color: var(--vscode-textPreformat-background);
        }

        .botao {
            padding-left: 10px;
            padding-right: 10px;
            padding-top: 5px;
            padding-bottom: 5px;
            position: relative;
            display: inline;
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-tree-indentGuidesStroke);
            }

        .botao:hover {
            background-color: var(--vscode-editorActionList-focusBackground);
        }

    </style>
	<script>

	    const vscode = acquireVsCodeApi();

        function getKey(e) {
            console.log(e.key)
            if(e.key == 13){
                const elem =  e.target
                console.log(elem.value);
                getDados();
            }
        }

		function getDados() {

			console.log('getdados');

  			const Prefix = document.getElementById("prefix").value;
  			const Owner = document.getElementById("owner").value;

			console.log('<' + Prefix + '-' + Owner + '>');
		    const msgRetorno = '{"comando":"Lista","lista":{"Owner":"' + Owner + '", "Prefix":"' + Prefix + '"}}';
	        console.log(msgRetorno);
			vscode.postMessage(msgRetorno);
		}

        function getJob(jobName, jobId){
	        console.log("jobId " + jobId);
	        console.log("jobName " + jobName);
            const msgRetorno = '{"comando":"Job","jobname":"'+jobName+'","jobid":"'+jobId+'"}';
	        console.log(msgRetorno);
			vscode.postMessage(msgRetorno);
        }

        window.addEventListener('message', event => {

            const message = event.data; // The JSON data our extension sent
			console.log('Ficheiro ' + message.command);
            switch (message.command) {
                case 'Lista':
                    FormataLista(message.Lista);
                    break;
                case 'Spool':
                    FormataSpool(message.jobID, message.Spool);
                    break;
            }
        });

        function FormataLista(Lista) {

            console.log('Lista ' + Lista);
            document.getElementById('ListaJobs').innerHTML=Lista;

        }

        function FormataSpool(jobID, Spool){

            var ListaJobs = document.getElementById('ListaJobs');
            tbody.insertAfter(ListaJobs, Spool);
            // document.getElementById('Spool_'+jobID).innerHTML=Spool;

        }

	</script>
</head>

<body>
    <div>
        <form id="filters">
            <div class="filtro">
                <label for="prefix">Prefix:</label>
                <input type="text" id="prefix" name="Prefix" placeholder="*" onkeydown="getKey()" value="${pref}">
            </div>
            <div class="filtro">
                <label for="owner">Owner:</label>
                <input type="text" id="owner" name="Owner" placeholder="*" onkeydown="getKey()" value="${user}">
            </div>
            <div class="filtro">
                <a href="#"><div class="botao" onclick="getDados()">&#10004;</div></a>
            </div>
        </form>
    </div>
    <div id="lista">
        <table  id="ListaJobs">
            <tr>
                <th>${SetaExpandir}</th>
                <th>Job</th>
                <th>Job ID</th>
                <th>Status</th>
                <th>Max RC</th>
                <th>Class</th>
            </tr>
        </table>
    </div>
</body>

</html>
	`
    let painel = vscode.window.createWebviewPanel('Search Result', 'zJobs', 1, {
        enableScripts: true,
        enableFindWidget: true,
        retainContextWhenHidden: false
    });


    painel.webview.html = HTML;
    painel.webview.onDidReceiveMessage(message => {
        const mensagem = JSON.parse(message);
        switch (String(mensagem.comando)) {
            case "Lista":

                abreElemento(session, mensagem.lista.Prefix, mensagem.lista.Owner);

                break;

            case "Job":

                obtemJob(session, mensagem.jobname, mensagem.jobid);

            default:
                break;
        }
    });

    painel.onDidDispose(() => {
        painel.dispose();
    });


    function obtemJob(session, jobname, jobid) {

        (async () => {

            // This may take awhile...
            let response;
            response = await GetJobs.GetJobs.getSpoolFiles(session, jobname, jobid)
            console.log(response);
            const spool = FormataSpool(response);
            mostraSpool(jobid, spool);
        })().catch((err) => {
            console.error(err);
            process.exit(1);
        });
    }

    function mostraSpool(jobid, spool) {

        if (painel) {
            const mensagem = { "command": "Spool", "jobID": jobid, "Spool": spool }
            painel.webview.postMessage(mensagem);
        }
    }


    function FormataSpool(spool) {

        console.log(spool);
        // let linhas=[];
        let linhas = '';

        for (let i = 0; i < spool.length; i++) {
            const element = spool[i];
            const ddname = element.ddname;
            const stepname = element.stepname;
            // const linha = {"ddname":ddname, "stepname": stepname};
            // linhas.push(linha);
            const linha = `
                    <li>${ddname} - ${stepname}</li>
            `
            linhas += linha;
        }

        return `<td colspan="6"><ul>${linhas}</ul></td>`;
    }

    function abreElemento(session, Prefix, Owner) {

        if (Owner=='') {
            Owner= '*';
        }

        (async () => {

            // This may take awhile...
            let response;
            if (Prefix && Owner) {
                response = await GetJobs.GetJobs.getJobsByOwnerAndPrefix(session, Owner, Prefix)
            } else {
                if (Prefix) {
                    response = await GetJobs.GetJobs.getJobsByPrefix(session, Prefix)
                } else {
                    response = await GetJobs.GetJobs.getJobsByOwner(session, Owner);
                }
            }
            console.log(response);
            const linhas =  FormataLinhas(response);
            enviaLinhas(linhas);
        })().catch((err) => {
            console.error(err);
            process.exit(1);
        });
    }

    function FormataLinhas(response) {

        let linhas = new String;
        linhas += `            <tr>
                <th>${SetaComprimir}</th>
                <th>Job</th>
                <th>Job ID</th>
                <th>Status</th>
                <th>Max RC</th>
                <th>Class</th>
            </tr>`;
        for (let i = 0; i < response.length; i++) {

            const linha = `            <tr class='tr' id='${response[i].jobid}'>
                <td><a href='#' onclick='getJob("${response[i].jobname}","${response[i].jobid}")'>${SetaExpandir}</a></td>
                <td>${response[i].jobname}</td>
                <td>${response[i].jobid}</td>
                <td>${response[i].status}</td>
                <td>${response[i].retcode}</td>
                <td>${response[i].class}</td>
            </tr>`;
            // <tr id='Spool_${response[i].jobid}' class="spool" ><td colspan="6"></td></tr>`;
            linhas += linha;
        }
        return linhas;
    }

    function enviaLinhas(linhas) {

        if (painel) {
            const Linhas = { "command": "Lista", "Lista": `${linhas}` };
            painel.webview.postMessage(Linhas);
        }
    }

}