import { Component, signal, effect, OnDestroy } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { FluidModule } from 'primeng/fluid';
import { LayoutService } from '../../layout/service/layout.service';

@Component({
  selector: 'app-chart-demo',
  standalone: true,
  imports: [ChartModule, FluidModule],
  template: `
    <p-fluid class="grid grid-cols-12 gap-8">
      <div class="col-span-12 xl:col-span-6">
        <div class="card">
          <div class="font-semibold text-xl mb-4">Linear</div>
          <p-chart type="line" [data]="lineData()" [options]="lineOptions()"></p-chart>
        </div>
      </div>
      <div class="col-span-12 xl:col-span-6">
        <div class="card">
          <div class="font-semibold text-xl mb-4">Bar</div>
          <p-chart type="bar" [data]="barData()" [options]="barOptions()"></p-chart>
        </div>
      </div>
      <div class="col-span-12 xl:col-span-6">
        <div class="card flex flex-col items-center">
          <div class="font-semibold text-xl mb-4">Pie</div>
          <p-chart type="pie" [data]="pieData()" [options]="pieOptions()"></p-chart>
        </div>
      </div>
      <div class="col-span-12 xl:col-span-6">
        <div class="card flex flex-col items-center">
          <div class="font-semibold text-xl mb-4">Doughnut</div>
          <p-chart type="doughnut" [data]="pieData()" [options]="pieOptions()"></p-chart>
        </div>
      </div>
      <div class="col-span-12 xl:col-span-6">
        <div class="card flex flex-col items-center">
          <div class="font-semibold text-xl mb-4">Polar Area</div>
          <p-chart type="polarArea" [data]="polarData()" [options]="polarOptions()"></p-chart>
        </div>
      </div>
      <div class="col-span-12 xl:col-span-6">
        <div class="card flex flex-col items-center">
          <div class="font-semibold text-xl mb-4">Radar</div>
          <p-chart type="radar" [data]="radarData()" [options]="radarOptions()"></p-chart>
        </div>
      </div>
    </p-fluid>
  `
})
export class ChartDemo implements OnDestroy {
  lineData = signal<any>(null);
  barData = signal<any>(null);
  pieData = signal<any>(null);
  polarData = signal<any>(null);
  radarData = signal<any>(null);
  lineOptions = signal<any>(null);
  barOptions = signal<any>(null);
  pieOptions = signal<any>(null);
  polarOptions = signal<any>(null);
  radarOptions = signal<any>(null);

  constructor(private layoutService: LayoutService) {
    // Use effect to reactively update charts when layout configuration changes
    effect(() => {
      // Access the layout config signal to trigger the effect
      this.layoutService.layoutConfig();
      this.initCharts();
    });
  }

  ngOnInit() {
    this.initCharts();
  }

  ngOnDestroy() {
    // No need for manual subscription cleanup with signals
  }

  initCharts() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.barData.set({
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'My First dataset',
          backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
          borderColor: documentStyle.getPropertyValue('--p-primary-500'),
          data: [65, 59, 80, 81, 56, 55, 40]
        },
        {
          label: 'My Second dataset',
          backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
          borderColor: documentStyle.getPropertyValue('--p-primary-200'),
          data: [28, 48, 40, 19, 86, 27, 90]
        }
      ]
    });

    this.barOptions.set({
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500
            }
          },
          grid: {
            display: false,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    });

    this.pieData.set({
      labels: ['A', 'B', 'C'],
      datasets: [
        {
          data: [540, 325, 702],
          backgroundColor: [documentStyle.getPropertyValue('--p-indigo-500'), documentStyle.getPropertyValue('--p-purple-500'), documentStyle.getPropertyValue('--p-teal-500')],
          hoverBackgroundColor: [documentStyle.getPropertyValue('--p-indigo-400'), documentStyle.getPropertyValue('--p-purple-400'), documentStyle.getPropertyValue('--p-teal-400')]
        }
      ]
    });

    this.pieOptions.set({
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: textColor
          }
        }
      }
    });

    this.lineData.set({
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'First Dataset',
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: false,
          backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
          borderColor: documentStyle.getPropertyValue('--p-primary-500'),
          tension: 0.4
        },
        {
          label: 'Second Dataset',
          data: [28, 48, 40, 19, 86, 27, 90],
          fill: false,
          backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
          borderColor: documentStyle.getPropertyValue('--p-primary-200'),
          tension: 0.4
        }
      ]
    });

    this.lineOptions.set({
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    });

    this.polarData.set({
      datasets: [
        {
          data: [11, 16, 7, 3],
          backgroundColor: [documentStyle.getPropertyValue('--p-indigo-500'), documentStyle.getPropertyValue('--p-purple-500'), documentStyle.getPropertyValue('--p-teal-500'), documentStyle.getPropertyValue('--p-orange-500')],
          label: 'My dataset'
        }
      ],
      labels: ['Indigo', 'Purple', 'Teal', 'Orange']
    });

    this.polarOptions.set({
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        r: {
          grid: {
            color: surfaceBorder
          },
          ticks: {
            display: false,
            color: textColorSecondary
          }
        }
      }
    });

    this.radarData.set({
      labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
      datasets: [
        {
          label: 'My First dataset',
          borderColor: documentStyle.getPropertyValue('--p-indigo-400'),
          pointBackgroundColor: documentStyle.getPropertyValue('--p-indigo-400'),
          pointBorderColor: documentStyle.getPropertyValue('--p-indigo-400'),
          pointHoverBackgroundColor: textColor,
          pointHoverBorderColor: documentStyle.getPropertyValue('--p-indigo-400'),
          data: [65, 59, 90, 81, 56, 55, 40]
        },
        {
          label: 'My Second dataset',
          borderColor: documentStyle.getPropertyValue('--p-purple-400'),
          pointBackgroundColor: documentStyle.getPropertyValue('--p-purple-400'),
          pointBorderColor: documentStyle.getPropertyValue('--p-purple-400'),
          pointHoverBackgroundColor: textColor,
          pointHoverBorderColor: documentStyle.getPropertyValue('--p-purple-400'),
          data: [28, 48, 40, 19, 96, 27, 100]
        }
      ]
    });

    this.radarOptions.set({
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        r: {
          pointLabels: {
            color: textColor
          },
          grid: {
            color: surfaceBorder
          }
        }
      }
    });
  }
}
