// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const GetJobs = require("@zowe/zos-jobs-for-zowe-sdk");
const zowe_explorer_api = require("@zowe/zowe-explorer-api");


const SetaExpandir = '&#11208;';
const SetaComprimir = '&#11206;';
const documento = '&#128459;';

let user = '';
let pref = '';
let sessao;

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

        if (!painel) {
            switch (true) {
                case String(node.contextValue).startsWith('session_type='):
                case String(node.contextValue).startsWith('profile'):
                    sessao = node.session;
                    break;
                case String(node.contextValue).startsWith('pds'):
                case String(node.contextValue).startsWith('server'):
                case String(node.contextValue).startsWith('job_'):
                    sessao = node.mParent.session;
                    break;
                case String(node.contextValue).startsWith('member'):
                case String(node.contextValue).startsWith('spool'):
                    sessao = node.mParent.mParent.session;
                    break;

                default:
                    break;
            }
            OpenWebView(sessao);

        }
    });

    let Purge = vscode.commands.registerCommand('zjobs.Purge', function (dados) {
        // The code you place here will be executed every time your command is executed

        deleteJob(sessao, dados.JobName, dados.JobId);

    });
    let GetJCL = vscode.commands.registerCommand('zjobs.GetJCL', function (dados) {
        // The code you place here will be executed every time your command is executed

        obtemJCL(sessao, dados.JobName, dados.JobId);

    });
    let GetSysoutList = vscode.commands.registerCommand('zjobs.GetSysoutList', function (dados) {
        // The code you place here will be executed every time your command is executed

        obtemJob(sessao, dados.JobName, dados.JobId);

    });
    let GetSysout = vscode.commands.registerCommand('zjobs.GetSysout', function (dados) {
        // The code you place here will be executed every time your command is executed

        obtemSpool(sessao, dados.JobName, dados.JobId, dados.SpoolId);

    });
    let Refresh = vscode.commands.registerCommand('zjobs.Refresh', function (dados) {
        // The code you place here will be executed every time your command is executed

        RefreshJob(sessao, dados.JobId);

    });
    let Cancel = vscode.commands.registerCommand('zjobs.Cancel', function (dados) {
        // The code you place here will be executed every time your command is executed

        CancelJob(sessao, dados.JobName, dados.JobId);

    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(GetJCL);
    context.subscriptions.push(Purge);
    context.subscriptions.push(GetSysoutList);
    context.subscriptions.push(GetSysout);
    context.subscriptions.push(Refresh);
    context.subscriptions.push(Cancel);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
    activate,
    deactivate
}

function OpenWebView(session) {

    if (!pref && !user) {
        // user = session.mISession.user;
        // pref = session.mISession.user + '*';
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

        .botaoJCL {
            margin-block-end: 8px;
            padding: 2px;
            position: relative;
            display: block;
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-button-background);
            }

        .botaoJCL:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        .spoollist {

            padding-inline: 10%;
            table {
        		tr:nth-child(even) {
                    background-color: var(--vscode-textBlockQuote-background);
                }
                .tr:hover {
                    background-color: var(--vscode-editorActionList-focusBackground);
                    cursor: pointer;
                }
            }
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
			console.log('message.Job ' + message.Job);
            switch (message.command) {
                case 'Lista':
                    FormataLista(message.Lista);
                    break;
                case 'Spool':
                    FormataSpool(message.jobID, message.Spool);
                    break;
                case 'Job':
                    FormataJob(message.jobID, message.Job);
                    break;
            }
        });

        function FormataLista(Lista) {

            console.log('Lista ' + Lista);
            document.getElementById('ListaJobs').innerHTML=Lista;

        }

        function FormataSpool(jobID, Spool){

            var Linha = document.getElementById(jobID);
            var ListaJobs = document.getElementById('ListaJobs');
            var novaLinha = ListaJobs.insertRow(Linha.rowIndex+1);
            novaLinha.ID='Spool_' + jobID;
            novaLinha.innerHTML = Spool;

        }

        function FormataJob(jobID, Job){

            console.log('jobID ' + jobID);
            console.log('Job ' + Job);

            var Linha = document.getElementById(jobID);
            Linha.innerHTML = Job;

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
                <input type="text" onkeydown="tecla(event)" id="prefix" name="Prefix" placeholder="*" value="${pref}" maxlength="10">
            </div>
            <div class="filtro">
                <label for="owner">Owner:</label>
                <input type="text" onkeydown="tecla(event)" id="owner" name="Owner" placeholder="*" value="${user}" maxlength="8">
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

    painel = vscode.window.createWebviewPanel('zJobsWebview', 'zJobs', 1, {
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
        painel = undefined;
    });


    function abreElemento(session, Prefix, Owner) {


        (async () => {

            // This may take awhile...
            let response;
            if (Prefix && Owner) {
                response = await GetJobs.GetJobs.getJobsByOwnerAndPrefix(session, Owner, Prefix)
            } else {
                if (Prefix) {
                    response = await GetJobs.GetJobs.getJobsByOwnerAndPrefix(session, '*', Prefix)
                } else {
                    if (Owner) {
                        response = await GetJobs.GetJobs.getJobsByOwner(session, Owner);
                    } else {
                        vscode.window.showErrorMessage("No prefix and Owner defined.");
                        return;
                    }
                }
            }
            console.log(response);
            if (response.length == 0) {
                vscode.window.showErrorMessage("No jobs returned");
            } else {
                const linhas = FormataLinhas(response);
                enviaLinhas(linhas);
            }
        })().catch((err) => {
            vscode.window.showErrorMessage(err);
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

            const linha = `            <tr id="${response[i].jobid}" onclick='getJob("${response[i].jobname}","${response[i].jobid}")' class='tr' id='${response[i].jobid}' data-vscode-context='{"webviewSection": "Job", "JobName":"${response[i].jobname}", "JobId":"${response[i].jobid}"}'>
                ${FormataLinha(response[i])}
            </tr>`;
            // <td id="Seta_${response[i].jobid}">${SetaExpandir}</td>
            // <td>${response[i].jobname}</td>
            // <td>${response[i].jobid}</td>
            // <td>${response[i].status}</td>
            // <td>${response[i].retcode}</td>
            // <td>${response[i].class}</td>

            // linhas += FormataLinha(response[i]);
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

function obtemJCL(session, jobname, jobid) {

    (async () => {

        // This may take awhile...
        let response;
        response = await GetJobs.GetJobs.getJcl(session, jobname, jobid)
        console.log(response);
        abreficheiro(response, jobname + '.' + jobid, 'jcl');
    })().catch((err) => {
        vscode.window.showErrorMessage(err);
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
            vscode.window.showErrorMessage(error);
            console.error(error);
            debugger;

        });
    } else {
        vscode.window.showErrorMessage('No workspace defined!');
    }

}

function obtemJob(session, jobname, jobid) {

    (async () => {

        // This may take awhile...
        let response;
        response = await GetJobs.GetJobs.getSpoolFiles(session, jobname, jobid)
        console.log(response);
        const spool = FormataSpool(response);
        mostraSpool(jobid, spool);
    })().catch((err) => {
        vscode.window.showErrorMessage(err);
        console.error(err);
        process.exit(1);
    });
}

function RefreshJob(session, jobid) {

    (async () => {

        // This may take awhile...
        let response;
        response = await GetJobs.GetJobs.getJob(session, jobid)
        const Job = await FormataLinha(response);
        console.log(Job);
        mostraJob(jobid, Job);
    })().catch((err) => {
        vscode.window.showErrorMessage(err);
        console.error(err);
        process.exit(1);
    });
}

function FormataLinha(response) {

    const linha = `<td id="Seta_${response.jobid}">${SetaExpandir}</td>
                <td>${response.jobname}</td>
                <td>${response.jobid}</td>
                <td>${response.status}</td>
                <td>${response.retcode}</td>
                <td>${response.class}</td>`;
    return linha;

}



function mostraJob(jobid, job) {

    if (painel) {
        const mensagem = { "command": "Job", "jobID": jobid, "Job": job };
        painel.webview.postMessage(mensagem);
    }
}


function FormataSpool(spool) {

    console.log(spool);
    // let linhas=[];
    let linhas = '';
    let jobId = '';

    for (let i = 0; i < spool.length; i++) {
        const element = spool[i];
        const ddname = element.ddname;
        const stepname = element.stepname;
        const nLinhas = element["record-count"];
        const jobid = element.jobid;
        jobId = jobid;
        const jobname = element.jobname;
        // jobName = jobname;
        const spoolid = element.id;
        const linha = `
                    <tr class="tr" onclick="Abrir('${jobname}', '${jobid}', '${spoolid}', '${ddname}')" data-vscode-context='{"webviewSection": "Spool" , "JobName":"${jobname}", "JobId":"${jobid}", "SpoolId":"${spoolid}"}'><td>${documento}</td><td>${stepname}</td><td>${ddname}</td><td>${nLinhas}</td></tr>
            `
        linhas += linha;
    }

    return `<td  id="Spool_${jobId}" colspan="6" class="spoollist"><table class="spool"><tr><th>${SetaComprimir}</th><th>Step</th><th>DD</th><th>Records</th></tr>${linhas}</table>            <div class="filtro">
    </div></td>`;
    // <a href="#"><div class="botaoJCL" onclick="AbrirJCL('${jobName}', '${jobId}')">Get JCL</div></a>
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
        vscode.window.showErrorMessage(err);
        console.error(err);
        process.exit(1);
    });
}


function deleteJob(session, jobname, jobid) {

    (async () => {

        // This may take awhile...
        let response;
        response = await GetJobs.DeleteJobs.deleteJob(session, jobname, jobid);
        console.log(response);
        const spool = FormataSpool(response);
        mostraSpool(jobid, spool);
    })().catch((err) => {
        vscode.window.showErrorMessage(err);
        console.error(err);
        process.exit(1);
    });
}


function CancelJob(session, jobname, jobid) {

    (async () => {

        // This may take awhile...
        let response;
        response = await GetJobs.CancelJobs.cancelJob(session, jobname, jobid);
        console.log(response);
        const spool = FormataSpool(response);
        mostraSpool(jobid, spool);
    })().catch((err) => {
        vscode.window.showErrorMessage(err);
        console.error(err);
        process.exit(1);
    });
}