function drawFreakScoreGraph(freakValue) {
    $('#_freakPercentage').html(freakValue);
    const gaugeNeedle = {
        afterDatasetDraw(chart, args, options) {
            const { 
                ctx, config, data, 
                chartArea: { width, height} 
            } = chart;
            ctx.save();
    
            const needleValue = data.datasets[0].needleValue;
            const angle = Math.PI + needleValue / 100 * Math.PI;
    
            const x = width / 2;
            const y = chart._metasets[0].data[0].y - 4;
    
            //needle
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, -2);
            ctx.lineTo(x - 10, 0);
            ctx.lineTo(0, 2);
            ctx.fillStyle = '#444';
            ctx.fill();
    
            //needle dot
            ctx.translate(-x, -y);
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 10);
            ctx.fill();
            ctx.restore();
        }
    }
    
    const data = {
        labels: ['Vanilla 🍦', 'Adventurous 🍆', 'Freak! 🌶️'],
        datasets: [{
            data: [33, 34, 33],
            backgroundColor: ['rgba(9, 167, 221, .5)', 'rgba(255, 170, 225, .5)', 'rgba(255, 110, 110, 0.5)'],
            needleValue: freakValue,
            borderColor: 'white',
            borderWidth: 0,
            cutout: '80%',
            circumference: 180,
            rotation: 270,
            borderRadius: 5,
            hoverOffset: 4
        }]
    };
    
    const config = {
        type: 'doughnut',
        data: data,
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function() {
                            return "";
                        }
                    }
                }
            }
        },
        plugins: [gaugeNeedle]
    };
    
    new Chart(
        $('#_freakGraph'),
        config
    );
}

function drawPreferencesGraph(dataset) {
    const data = {
        labels: dataset.labels,
        datasets: [
            {
                data: dataset.data,
                borderColor: 'rgb(9, 167, 221)',
                backgroundColor: 'rgba(9, 167, 221, .5)',
            }
        ]
    };

    const config = {
        type: 'radar',
        data: data,
        options: {
            scale: {
                min: 0,
                max: 4
            },
            plugins: {
                legend: {
                    display: false,
                },  
                tooltip: {
                    callbacks: {
                        label: function() {
                            return "";
                        }
                    }
                }
            },
            responsive: true,
            scales: {
                r: {
                    ticks: {
                        display: false,       
                        stepSize: .5
                    },
                }
            }
        },
    };

    new Chart(
        $('#_preferencesGraph'),
        config
    );
}