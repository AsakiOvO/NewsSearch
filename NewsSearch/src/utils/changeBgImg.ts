import { ref, computed, onMounted } from 'vue'

export function useChangeBgImg() {
    // 更换背景图片
    const imgList = [
        { url: 'src/assets/bgImg/bg1.jpg' },
        { url: 'src/assets/bgImg/bg2.jpg' },
        { url: 'src/assets/bgImg/bg3.jpg' },
        { url: 'src/assets/bgImg/bg4.jpg' },
        { url: 'src/assets/bgImg/bg5.jpg' },
        { url: 'src/assets/bgImg/bg6.jpg' },
        { url: 'src/assets/bgImg/bg7.jpg' },
        { url: 'src/assets/bgImg/bg8.jpg' },
        { url: 'src/assets/bgImg/bg9.jpg' },
        { url: 'src/assets/bgImg/bg10.jpg' },
        { url: 'src/assets/bgImg/bg11.jpg' },
        { url: 'src/assets/bgImg/bg12.jpg' },
        { url: 'src/assets/bgImg/bg13.jpg' },
        { url: 'src/assets/bgImg/bg14.jpg' },
        { url: 'src/assets/bgImg/bg15.jpg' },
        { url: 'src/assets/bgImg/bg16.jpg' },
        { url: 'src/assets/bgImg/bg17.jpg' },
        { url: 'src/assets/bgImg/bg18.jpg' },
        { url: 'src/assets/bgImg/bg19.jpg' },
        { url: 'src/assets/bgImg/bg20.jpg' },
        { url: 'src/assets/bgImg/bg21.jpg' },
        { url: 'src/assets/bgImg/bg22.jpg' },
        { url: 'src/assets/bgImg/bg23.jpg' }
    ]
    // 第一张图片随机
    const random = Math.round(Math.random() * imgList.length - 1)
    const nowIndex = ref(random)
    // 记录是否为初始化
    let isInitialState = true
    const backgroundImg = ref<{ background: string } | {}>()
    const handleChangeBackground = () => {
        isInitialState = false
        if (nowIndex.value === imgList.length) {
            nowIndex.value = 1
        } else {
            nowIndex.value++
        }
        backgroundImg.value = { background: `url(${imgList[nowIndex.value - 1].url}) no-repeat center/cover` }
    }

    const resetBackground = () => {
        backgroundImg.value = {}
        nowIndex.value = 0
        isInitialState = true
    }

    const IconColor = computed(() => {
        if (nowIndex.value !== 0 && !isInitialState) {
            return 'text-cyan-500'
        } else {
            return 'text-gray-500'
        }
    })

    // 鼠标进入改变背景按钮，结束按钮的动画
    const handleOverChangeBackground = () => {
        const changeBgBtn = document.querySelector('.changeBgIcon')
        changeBgBtn?.classList.remove('rotateIcon')
    }

    // 鼠标离开改变背景按钮，启动按钮的动画
    const handleLeaveChangeBackground = () => {
        const changeBgBtn = document.querySelector('.changeBgIcon')
        changeBgBtn?.classList.add('rotateIcon')
    }

    onMounted(() => {
        snowCanvas()
    })

    // 雪花特效
    const snowCanvas = () => {
        let container = document.querySelector('.index-container') as HTMLDivElement
        let canvas = document.querySelector('.mycanvas') as HTMLCanvasElement
        let context = canvas?.getContext('2d') as CanvasRenderingContext2D
        let w = container.clientWidth
        let h = container.clientHeight
        canvas.width = w
        canvas.height = h
        window.onresize = canvasOnresize

        let num = 200
        let snows = new Array<{ x: number; y: number; r: number }>()
        for (let i = 0; i < num; i++) {
            snows.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 3 + 1
            })
        }

        const move = () => {
            for (let i = 0; i < num; i++) {
                let snow = snows[i]
                snow.x += Math.random() * 2 + 1
                snow.y += Math.random() * 2 + 1
                if (snow.x > w) {
                    snow.x = 0
                }
                if (snow.y > h) {
                    snow.y = 0
                }
            }
        }

        const draw = () => {
            context.clearRect(0, 0, w, h)
            context.beginPath()
            context.fillStyle = '#f0fcff'
            context.shadowColor = '#f0fcff'
            context.shadowBlur = 10
            for (let i = 0; i < num; i++) {
                let snow = snows[i]
                context.moveTo(snow.x, snow.y)
                context.arc(snow.x, snow.y, snow.r, 0, Math.PI * 2)
            }
            context.fill()
            context.closePath()
            move()
        }

        draw()

        function canvasOnresize() {
            w = container.clientWidth
            h = container.clientHeight
            canvas.width = w
            canvas.height = h
            snows.splice(0, snows.length)
            for (let i = 0; i < num; i++) {
                snows.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    r: Math.random() * 3 + 1
                })
            }
            draw()
        }

        setInterval(draw, 30)
    }
    return {
        backgroundImg,
        IconColor,
        handleChangeBackground,
        resetBackground,
        handleOverChangeBackground,
        handleLeaveChangeBackground
    }
}