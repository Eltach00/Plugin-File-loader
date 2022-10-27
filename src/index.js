import InpuFile from "./upload"


const upload = new InpuFile('file', {
    multiple: true,
    accept: ['.jpg', '.png', '.gif', '.jpeg']
})

upload.render()