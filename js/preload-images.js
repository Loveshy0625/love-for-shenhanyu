/**
 * 照片预加载脚本
 * 在页面加载时提前缓存所有照片，提升显示速度
 */

(function() {
    // 所有需要预加载的照片列表
    var imagesToPreload = [
        // 偶像相关
        'img/朴彩英.jpg',
        'img/朴彩英rose.jpg',
        'img/cxk.jpg',
        
        // 我们的照片
        'img/第一次见面.jpg',
        'img/第一次见面的花.png',
        'img/国庆节.jpg',
        'img/国庆节副本.jpg',
        'img/国庆节花花.jpg',
        'img/元旦的我们.png',
        'img/元旦礼物.jpg',
        'img/元旦礼物副本.png',
        
        // 游戏角色
        'img/西施.jpg',
        'img/园丁.jpg',
        'img/调香师.jpg',
        'img/02.jpg',
        
        // 动漫角色
        'img/巴卫和娜娜米.jpg',
        'img/巴卫和nanami.jpg',
        'img/冰公主.jpg',
        'img/微信图片冰公主.jpg',
        'img/微信图片冰公主1.jpg',
        'img/库洛米.jpg',
        
        // 其他图片

        'img/微信图片_影院.jpg',
        
        // 苏苏相关图片
        'img/影院.jpg',
        'img/出cos.jpg',
        'img/loopy.jpg',
        'img/五条悟.jpg',
        'img/石膏手作.jpg',
        'img/第五人格.jpg',
        'img/窝房间.jpg',
        'img/骑车.jpg',
        'img/狗狗.jpg',
        'img/高中.jpg',
        'img/国庆节.jpg',
        'img/国庆节副本.jpg',

        'img/苏苏和申.jpg',
        'img/苏苏和申申.jpg',
        'img/申和苏苏.jpg'
    ];

    var loadedCount = 0;
    var totalCount = imagesToPreload.length;

    // 暴露预加载状态到全局
    window.imagesPreloaded = false;
    window.checkImagesPreloaded = function() {
        return loadedCount === totalCount;
    };

    // 延迟预加载，避免阻塞页面渲染
    function startPreload() {
        console.log('📸 开始预加载照片，共 ' + totalCount + ' 张...');

        // 分批预加载，每批加载5张
        var batchSize = 5;
        var currentIndex = 0;

        function loadBatch() {
            var batch = imagesToPreload.slice(currentIndex, currentIndex + batchSize);
            if (batch.length === 0) {
                console.log('🎉 所有照片预加载完成！');
                window.imagesPreloaded = true;
                return;
            }

            batch.forEach(function(src) {
                var img = new Image();
                
                img.onload = function() {
                    loadedCount++;
                    console.log('✅ 已加载：' + src + ' (' + loadedCount + '/' + totalCount + ')');
                };
                
                img.onerror = function() {
                    console.warn('❌ 加载失败：' + src);
                    loadedCount++;
                };
                
                // 开始加载
                img.src = src;
            });

            // 延迟加载下一批，给浏览器时间处理其他任务
            currentIndex += batchSize;
            setTimeout(loadBatch, 200);
        }

        // 开始第一批加载
        loadBatch();
    }

    // 页面加载完成后开始预加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startPreload);
    } else {
        startPreload();
    }

})();
