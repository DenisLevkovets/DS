let consoleD = document.querySelector('.console');
let outputs = document.querySelector('#outputs');
let input_cmd = document.querySelector('.console-input');
let cur_dir = document.querySelector('.cur_dir');
let file_input = document.querySelector('.file');
let ns_ip = 'http://localhost:5000';

async function inputHandler(e) {
    let key = e.which || e.keyCode;
    if (key === 13) { // 13 is enter
        e.preventDefault();
        let cmd = input_cmd.value;

        let output_cmd = document.createElement('div');
        output_cmd.className = 'output-cmd';
        output_cmd.innerHTML = cmd;

        let prev_dir = document.createElement('span');
        prev_dir.className = 'cur_dir';
        prev_dir.innerHTML = cur_dir.innerHTML;
        output_cmd.insertAdjacentElement('afterbegin', prev_dir);
        outputs.appendChild(output_cmd);
        let cmd_args = cmd.split(' ');
        let cmd_type = cmd_args[0];
        let cmd_output = await getCmdOutput(cmd_type, cmd_args.slice(1));
        if (cmd_output) {
            let output = document.createElement('p');
            output.style.margin = '0';
            output.className = 'output-cmd';
            output.innerHTML = cmd_output;
            outputs.appendChild(output)
        }
        consoleD.scrollTop = output_cmd.offsetHeight + outputs.offsetHeight;
        input_cmd.value = '';

    }
}

async function getCmdOutput(cmd_type, cmd_args) {
    let res, arg, dest, src;
    switch (cmd_type) {
        case "help":
            return 'Help';
        case "init":
            res = await init();
            return res;
        case 'touch':
            arg = cur_dir.innerHTML.length === 2 ? cmd_args[0] : cur_dir.innerHTML.substring(2) + '/' + cmd_args[0];
            res = await fileOperations('create', arg);
            if (res === '404') {
                return "No such directory"
            } else if (res === '500') {
                return 'File already exists'
            }
            break;
        case 'upload':
            file_input.addEventListener("click", function (evt) {
                evt.stopPropagation();
            }, false);

            file_input.click();


            break;
        case "read":
            arg = cur_dir.innerHTML.length === 2 ? cmd_args[0] : cur_dir.innerHTML.substring(2) + '/' + cmd_args[0];
            res = await downloadFile(arg);
            if (res === '404') {
                return 'No such file'
            }
            break;
        case "rm":
            arg = cur_dir.innerHTML.length === 2 ? cmd_args[0] : cur_dir.innerHTML.substring(2) + '/' + cmd_args[0];
            res = await deleteFile(arg);
            if (res === '404') {
                return "No such file"
            } else if (res === '500') {
                return 'It\'s not a file'
            }
            break;
        case "copy":
            src = cur_dir.innerHTML.length === 2 ? cmd_args[0] : cur_dir.innerHTML.substring(2) + '/' + cmd_args[0];
            dest = cmd_args[1];
            res = await moveAndCopy('copy', src, dest);
            if (res === '404') {
                return 'Error'
            }
            break;
        case "move":
            src = cur_dir.innerHTML.length === 2 ? cmd_args[0] : cur_dir.innerHTML.substring(2) + '/' + cmd_args[0];
            dest = cmd_args[1];
            res = await moveAndCopy('move', src, dest);
            if (res === '404') {
                return 'Error'
            }
            break;
        case "mkdir":
            arg = cur_dir.innerHTML.length === 2 ? cmd_args[0] : cur_dir.innerHTML.substring(2) + '/' + cmd_args[0];
            res = await dirOperations('make', arg);
            if (res === '404') {
                return "No such directory"
            } else if (res === '500') {
                return "File already exists"
            }
            break;
        case "rmdir":
            arg = cur_dir.innerHTML.length === 2 ? cmd_args[0] : cur_dir.innerHTML.substring(2) + '/' + cmd_args[0];
            res = await dirOperations('delete', arg);
            if (res === '404') {
                return "No such directory"
            } else if (res === '500') {
                return "It\'s not a directory"
            }
            break;
        case "ls":
            res = await dirOperations('read', cur_dir.innerHTML.substring(2));
            return res;
        case "cd":
            if (cmd_args.length === 0) {
                cur_dir.innerHTML = '~/';
            } else if (cmd_args && cmd_args[0] === '..') {
                let dirs = cur_dir.innerHTML.split('/');
                let new_dir = cur_dir.innerHTML.substring(0, cur_dir.innerHTML.length - dirs[dirs.length - 1].length - 1);
                if (new_dir.length === 1) {
                    cur_dir.innerHTML = '~/'
                } else {
                    cur_dir.innerHTML = new_dir;
                }
            } else {
                arg = cur_dir.innerHTML.length === 2 ? cmd_args[0] : cur_dir.innerHTML.substring(2) + '/' + cmd_args[0];
                res = await dirOperations('open', arg);
                if (res === '200') {
                    if (cur_dir.innerHTML[cur_dir.innerHTML.length - 1] === '/') {
                        cur_dir.innerHTML += cmd_args[0];
                    } else {
                        cur_dir.innerHTML += '/' + cmd_args[0];
                    }
                } else if (res === '404') {
                    return 'No such directory'
                } else if (res === '500') {
                    return 'It\'s not a directory'
                }
            }

            break;
        default:
            return "Hello, motherfuckers";
    }
}

async function dirOperations(optype, path) {
    let re = await fetch(ns_ip + `/dir/${optype}?path=${path}`, {
        method: 'GET'
    }).then(res => {
        return res.json()

    }).catch(err => {
        return err.json()
    });

    return re['res']
}

async function fileOperations(optype, path) {
    let re = await fetch(ns_ip + `/file/${optype}?path=${path}`, {
        method: 'GET'
    }).then(res => {
        return res.json()

    }).catch(err => {
        return err.json()
    });

    return re['res']
}


async function moveAndCopy(optype, src, dest) {
    let re = await fetch(ns_ip + `/file/${optype}?source=${src}&destination=${dest}`, {
        method: 'GET'
    }).then(res => {
        return res.json()

    }).catch(err => {
        return err.json()
    });

    return re['res']
}


async function init() {
    let re = await fetch(ns_ip + '/init', {
        method: 'GET'
    }).then(res => {
        return res.json()

    }).catch(err => {
        return err.json()
    });

    return re['res']
}


async function uploadFile(file, path) {
    let data = new FormData();
    data.append('file', file, file.name);
    data.append('path', path);

    let re = await fetch(ns_ip + `/file/write?path=${path}`, {
        method: 'GET',
    }).then(async res => {
        let response = await res.json();
        if (response['res'] !== "404") {
            let url = response['res'];
            let id = response['id'];
            data.append('index', id);
            return await fetch(url, {
                method: 'POST',
                body: data
            }).then(sres => {
                return sres.json()
            }).catch(rerr => {
                return rerr
            });
        }
    }).catch(err => {
        return {"res": err}
    });

    return re['res']
}

async function deleteFile(path) {
    let re = await fetch(ns_ip + `/file/delete?path=${path}`, {
        method: 'GET',
    }).then(async res => {
        let response = await res.json();
        if (response['status'] === '200') {
            let url = response['res'];
            let id = response['id'];
            return await fetch(url + `?index=${id}&path=${path}`, {
                method: 'GET',
            }).then(async sres => {
                return sres
            }).catch(serr => {
                return serr;
            })
        } else {
            return response['res'];
        }
    });
    return re;
}


async function downloadFile(path) {
    let re = await fetch(ns_ip + `/file/read?path=${path}`, {
        method: 'GET',
    }).then(async res => {
        let response = await res.json();
        if (response['res'] !== '404') {
            let url = response['res'];
            let id = response['id'];
            return await fetch(url + `?index=${id}`, {
                method: 'GET',
            }).then(async sres => {
                let fd = await sres.blob()
                console.log(fd)
                let filename = path.split('/')[path.split('/').length - 1];
                saveBlob(fd, filename);
                return fd
            }).catch(rerr => {
                return rerr
            });
        } else {
            return "404"
        }

    }).catch(err => {
        return {"res": err}
    });
    return re
}

function saveBlob(blob, fileName) {
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    let url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

}

input_cmd.addEventListener('keypress', inputHandler);
file_input.addEventListener("change", async () => {
    console.log('wtf')
    let file = file_input.files[0];
    let arg = cur_dir.innerHTML.length === 2 ? file.name : cur_dir.innerHTML.substring(2) + '/' + file.name;
    let res = await uploadFile(file, arg);
}, false);

//ParticlesBG
particlesJS('particles-js', {
    'particles': {
        'number': {'value': 50},
        'color': {'value': '#ffffff'},
        'shape': {'type': 'triangle', 'polygon': {'nb_sides': 5}},
        'opacity': {'value': 0.06, 'random': false},
        'size': {'value': 11, 'random': true},
        'line_linked': {'enable': true, 'distance': 150, 'color': '#ffffff', 'opacity': 0.4, 'width': 1},
        'move': {'enable': true, 'speed': 4, 'direction': 'none', 'random': false, 'straight': false, 'out_mode': 'out', 'bounce': false}
    },
    'interactivity': {
        'detect_on': 'canvas',
        'events': {'onhover': {'enable': false}, 'onclick': {'enable': true, 'mode': 'push'}, 'resize': true},
        'modes': {'push': {'particles_nb': 4}}
    },
    'retina_detect': true
}, function () {
});
