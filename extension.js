// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const request = require('request');
const CryptoJS = require('crypto-js');  //引用AES源码js

let config = { 
	serverAddr: '',
	run: true,
	username : '',
	password : '',
	proxy : '',
	timer: null,
	checktime: 2000,
	aes: ''
};

// AES加密
function Encrypt(word) {
	if(config.aes.length != 16)
	{
		return word;
	}
	
	let key = CryptoJS.enc.Utf8.parse(config.aes);
	let encryptedData  = CryptoJS.AES.encrypt(word, key, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	});
	let hexData = encryptedData.ciphertext.toString();
    return hexData;
}

// AES解密
function Decrypt(word) {
	if(config.aes.length != 16)
	{
		return word;
	}

	let key = CryptoJS.enc.Utf8.parse(config.aes);
	let encryptedHexStr  = CryptoJS.enc.Hex.parse(word);
	let encryptedBase64Str  = CryptoJS.enc.Base64.stringify(encryptedHexStr);
	let decryptedData  = CryptoJS.AES.decrypt(encryptedBase64Str, key, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	});
	let text = decryptedData.toString(CryptoJS.enc.Utf8);
    return text;
}

function timerRequest() {
	if(config.run == false)
	{
		return
	}

	// console.log('username', config.username, config.password, config.proxy);

	var options = {
		'method': 'GET',
		'url': `http://${config.serverAddr}/request?username=${config.username}&password=${config.password}`,
		'proxy': config.proxy,
	};
	request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			if(body != '')
			{
				body = String(body)
				let start = body.indexOf(']') + 1
				body = body.substring(0, start + 1) + Decrypt(body.substring(start + 1))
				console.log(body) 
				vscode.window.showInformationMessage(body);
			}
		}
	})

}
// const config.serverAddr = 'api.chengs.run'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

// vsce package

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "chattingfish" is now active!');

	let send = vscode.commands.registerCommand('chattingfish.send', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInputBox().then(value => {
			value = value || ''
			if(value == '')
			{
				return
			}

			try {
				let url = `http://${config.serverAddr}/send?username=${config.username}&password=${config.password}&text=${Encrypt(value)}`

				console.log('input: ', String(value));
				var options = {
					'method': 'GET',
					'url': encodeURI(url),
					'proxy': config.proxy,
				};

				request(options);				
			} catch (error) {
				console.log(error);
			}

		});
	})

	context.subscriptions.push(send);

	let start = vscode.commands.registerCommand('chattingfish.start', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('start');

		config.serverAddr = vscode.workspace.getConfiguration("chattingfish").get("serverAddr") || '';
		config.username = vscode.workspace.getConfiguration("chattingfish").get("username") || '';
		config.password = vscode.workspace.getConfiguration("chattingfish").get("password") || '';
		config.proxy = vscode.workspace.getConfiguration("chattingfish").get("proxy") || '';
		config.aes = vscode.workspace.getConfiguration("chattingfish").get("aes") || '';
		config.checktime = vscode.workspace.getConfiguration("chattingfish").get("checktime") || 2000;
		if(config.checktime < 200)
			config.checktime = 200
		
		console.log(config);
		// if(config.proxy != null)
		// {
		// 	console.log('use proxy' + config.proxy);
		// 	request.defaults({proxy: config.proxy})
		// }
		config.run = true;

		if(config.timer)
		{
			clearInterval(config.timer)
		}

		config.timer = setInterval(timerRequest, config.checktime);

	});

	context.subscriptions.push(start);

	context.subscriptions.push(vscode.commands.registerCommand('chattingfish.stop', () => {
		config.run = false;
		vscode.window.showInformationMessage('stop');
	}));

}

// This method is called when your extension is deactivated
function deactivate() {
	clearInterval(config.timer)
}

module.exports = {
	activate,
	deactivate
}
