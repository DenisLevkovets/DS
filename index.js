let consoleD = document.querySelector('.console');
let outputs = document.querySelector('#outputs');
let input_cmd = document.querySelector('.console-input');
let current_dir = "~~";

async function inputHandler(e) {
    let key = e.which || e.keyCode;
    if (key === 13) { // 13 is enter
        e.preventDefault();
        let output_cmd = document.createElement('div');
        let cmd = input_cmd.value;
        output_cmd.className = 'output-cmd';
        output_cmd.innerHTML = cmd;
        outputs.appendChild(output_cmd);
        let output = document.createElement('p');
        let cmd_args = cmd.split(' ');
        let cmd_type = cmd_args[1];
        // console.log(cmd_type, cmd_args.splice(2))
        output.innerHTML = await getCmdOutput(cmd_type, cmd_args.slice(2));
        consoleD.scrollTop = output.offsetHeight + outputs.offsetHeight;
        input_cmd.value = current_dir
        outputs.appendChild(output)
    }
}

async function getCmdOutput(cmd_type, cmd_args) {
    switch (cmd_type) {
        case "help":
            return 'Help';
        case "ls":
            let res = await readDir(current_dir.substring(3))
            console.log(res)
            return res;
        case "cd":
            current_dir += '/' + cmd_args[0];
            return current_dir;
        default:
            return "Hello, motherfuckers";
    }
}

async function readDir(path) {
    let re = await fetch(`http://localhost:5000/dir/read?path=${path}`, {
        method: 'GET'
    }).then(res => {
        return res.json()

    }).catch(err => {
        return err.json()
    });

    return re

}

input_cmd.addEventListener('keypress', inputHandler);
input_cmd.value = '~~';
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