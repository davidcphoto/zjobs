// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const ProfileInfo = require("@zowe/imperative");
const GetJobs = require("@zowe/zos-jobs-for-zowe-sdk");
const zowe_explorer_api = require("@zowe/zowe-explorer-api");
let user = '';
let pref = '';

let painel;

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
        if (!painel) {
            OpenWebView(node.session);
        }
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

    const SetaExpandir = '&#11208;';
    const SetaComprimir = '&#11206;';
    const documento = '&#128459;';
    if (!pref && !user) {
        user = session.mISession.user;
    }

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
            background-color: var(--vscode-textBlockQuote-background);
        }

        .tr:hover {
            background-color: var(--vscode-editorActionList-focusBackground);
            cursor: pointer;
        }

        td {
            padding-left: 20px;
            padding-right: 20px;
        }

        th {
            padding-left: 20px;
            padding-right: 20px;
        }

        .botao {
            padding-left: 10px;
            padding-right: 10px;
            padding-top: 5px;
            padding-bottom: 5px;
            position: relative;
            display: inline;
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-button-background);
            }

        .botao:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        .spoollist {

            padding: 10px;
            text-align: left;
            table {
                display: block;
        		tr:nth-child(even) {
                    background-color: var(--vscode-textBlockQuote-background);
                }
                .tr:hover {
                    background-color: var(--vscode-editorActionList-focusBackground);
                    cursor: pointer;
                }
            }
        }

        .spool {
            padding-left: 10%;
        }

    </style>
	<script>

	    const vscode = acquireVsCodeApi();

		function getDados() {

			console.log('getdados');

  			const Prefix = document.getElementById("prefix").value;
  			const Owner = document.getElementById("owner").value;

			console.log('<' + Prefix + '-' + Owner + '>');
		    const msgRetorno = '{"comando":"Lista","lista":{"Owner":"' + Owner + '", "Prefix":"' + Prefix + '"}}';
	        console.log(msgRetorno);
			vscode.postMessage(msgRetorno);
		}

        function tecla(evento) {
                console.log("tecla " + evento.key);
            if (evento.key==="Enter") {
                console.log("enter");
                getDados();
            }
        }

        function getJob(jobName, jobId){
	        console.log("jobId " + jobId);
	        console.log("jobName " + jobName);
            const spool = document.getElementById('Spool_'+jobId);
            const seta = document.getElementById('Seta_'+jobId);
	        console.log("spool " + spool);

            if (spool === null) {
                const msgRetorno = '{"comando":"Job","jobname":"'+jobName+'","jobid":"'+jobId+'"}';
                console.log(msgRetorno);
                vscode.postMessage(msgRetorno);
                    seta.innerHTML="&#11206;";
            } else {
                if (spool.style.display == "none") {
                    spool.style=undefined;
                    seta.innerHTML="&#11206;";

                } else {
                    spool.style.display = "none";
                    seta.innerHTML="&#11208;";
                }

            }
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

            console.log('jobID ' + jobID);
            console.log('Spool ' + Spool);
            var Linha = document.getElementById(jobID);
            var ListaJobs = document.getElementById('ListaJobs');
            console.log('Linha ' + Linha.rowIndex);
            var novaLinha = ListaJobs.insertRow(Linha.rowIndex+1);
            novaLinha.ID='Spool_' + jobID;
            novaLinha.innerHTML = Spool;



        }

        function Abrir(jobname, jobid, spoolid, DD) {

            console.log('jobid ' + jobid);
            console.log('DD ' + DD);
            console.log('spoolid ' + spoolid);
            const msgRetorno = '{"comando":"Spool", "jobname":"' + jobname + '","jobid":"' + jobid + '","spoolid":"'+spoolid+'","dd":"'+DD+'"}';
	        console.log(msgRetorno);
			vscode.postMessage(msgRetorno);

        }

        function AbrirJCL(jobname, jobid) {

            console.log('jobid ' + jobid);
            const msgRetorno = '{"comando":"JCL", "jobname":"' + jobname + '","jobid":"' + jobid + '"}';
	        console.log(msgRetorno);
			vscode.postMessage(msgRetorno);

        }

	</script>
</head>

<body>
    <div>
        <form id="filters">
            <div class="filtro">
                <label for="prefix">Prefix:</label>
                <input type="text" onkeydown="tecla(event)" id="prefix" name="Prefix" placeholder="*" value="${pref}">
            </div>
            <div class="filtro">
                <label for="owner">Owner:</label>
                <input type="text" onkeydown="tecla(event)" id="owner" name="Owner" placeholder="*" value="${user}">
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

    painel = vscode.window.createWebviewPanel('zJobs', 'zJobs', 1, {
        enableScripts: true,
        enableFindWidget: true,
        retainContextWhenHidden: true
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
                break;

            case "Spool":

                obtemSpool(session, mensagem.jobname, mensagem.jobid, mensagem.spoolid);
                break;

            case "JCL":

                obtemJCL(session, mensagem.jobname, mensagem.jobid);
                break;

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
    function obtemSpool(session, jobname, jobid, spoolId) {

        (async () => {

            // This may take awhile...
            let response;
            response = await GetJobs.GetJobs.getSpoolContentById(session, jobname, jobid, spoolId);
            console.log(response);
            abreficheiro(response, jobname + '.' + spoolId, 'spool');
        })().catch((err) => {
            console.error(err);
            process.exit(1);
        });
    }

    function obtemJCL(session, jobname, jobid) {

        (async () => {

            // This may take awhile...
            let response;
            response = await GetJobs.GetJobs.getJcl(session, jobname, jobid)
            console.log(response);
            abreficheiro(response, jobname + '.' + jobid, 'jcl');
        })().catch((err) => {
            console.error(err);
            process.exit(1);
        });
    }

    function abreficheiro(texto, Ficheiro = '', extensão = '') {

        const ficheiros = vscode.workspace.textDocuments;
        if (vscode.workspace.workspaceFolders !== undefined) {


            var nomeficheiro = vscode.workspace.workspaceFolders[0].uri.fsPath + "\\" + Ficheiro + '.' + extensão;

            let i = 0;
            let encontrou = true;

            while (encontrou == true) {
                encontrou = false;
                for (let j = 0; j < ficheiros.length; j++) {
                    if (ficheiros[j].fileName == nomeficheiro) {
                        encontrou = true;
                    }
                    if (encontrou) {
                        ++i;
                        nomeficheiro = vscode.workspace.workspaceFolders[0].uri.fsPath + "\\" + Ficheiro + "_v" + i + '.' + extensão;
                    }
                }

            }

            var setting = vscode.Uri.parse("untitled:" + nomeficheiro);


            vscode.workspace.openTextDocument(setting).then((a) => {
                vscode.window.showTextDocument(a, 1, false).then(e => {
                    e.edit(edit => {
                        edit.insert(new vscode.Position(0, 0), texto);
                    });

                })
            }, (error) => {
                console.error(error);
                debugger;

            });
        } else {
            vscode.window.showErrorMessage('No workspace defined!');
        }

    }


    function FormataSpool(spool) {

        console.log(spool);
        // let linhas=[];
        let linhas = '';
        let jobId = '';
        let jobName = '';

        for (let i = 0; i < spool.length; i++) {
            const element = spool[i];
            const ddname = element.ddname;
            const stepname = element.stepname;
            const nLinhas = element["record-count"];
            const jobid = element.jobid;
            jobId = jobid;
            const jobname = element.jobname;
            jobName = jobname;
            const spoolid = element.id;
            const linha = `
                    <tr class="tr" onclick="Abrir('${jobname}', '${jobid}', '${spoolid}', '${ddname}')"><td>${documento}</td><td>${stepname}</td><td>${ddname}</td><td>${nLinhas}</td></tr>
            `
            linhas += linha;
        }

        // return `<td colspan="6" class="spoollist"><ul>${linhas}</ul></td>`;
        return `<td  id="Spool_${jobId}" colspan="6" class="spoollist"><table class="spool"><tr><th>${SetaComprimir}</th><th>Step</th><th>DD</th><th>Records</th></tr>${linhas}</table>            <div class="filtro">
                <a href="#"><div class="botao" onclick="AbrirJCL('${jobName}', '${jobId}')">Get JCL</div></a>
            </div></td>`;
    }

    function abreElemento(session, Prefix, Owner) {

        if (Owner == '') {
            Owner = '*';
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
            const linhas = FormataLinhas(response);
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

            const linha = `            <tr onclick='getJob("${response[i].jobname}","${response[i].jobid}")' class='tr' id='${response[i].jobid}'>
                <td id="Seta_${response[i].jobid}">${SetaExpandir}</td>
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