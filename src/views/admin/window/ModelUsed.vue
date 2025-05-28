<!-- views/admin/window/ModelUsed.vue -->
<template>
  <div class="model-used-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>模型使用情况历史趋势</span>
          <div class="controls">
            <el-select
              v-model="selectedModels"
              multiple
              placeholder="选择要显示的模型"
              style="width: 300px; margin-right: 10px"
            >
              <el-option
                v-for="model in allModels"
                :key="model"
                :label="model"
                :value="model"
              />
            </el-select>
          </div>
        </div>
      </template>
      <div class="chart-container">
        <div ref="chartRef" style="width: 100%; height: 500px"></div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, computed } from 'vue';
import { useModelStore } from '@/stores/admin/modelStore';
import * as echarts from 'echarts';
import type { ECharts } from 'echarts';
import { ElMessage } from 'element-plus';

const modelStore = useModelStore();
const chartRef = ref<HTMLElement>();
let chartInstance: ECharts | null = null;

// 用户选择控制
const selectedModels = ref<string[]>([]);
const timeRange = ref<'1h' | '6h' | '12h' | '24h'>('1h');
// 计算属性
const allModels = computed(() => {
  return Object.keys(modelStore.modelHistoryData[0]?.data || {});
});

const filteredData = computed(() => {
  const now = new Date();
  let timeThreshold = new Date();

  switch (timeRange.value) {
    case '1h':
      timeThreshold.setHours(now.getHours() - 1);
      break;
    case '6h':
      timeThreshold.setHours(now.getHours() - 6);
      break;
    case '12h':
      timeThreshold.setHours(now.getHours() - 12);
      break;
    case '24h':
      timeThreshold.setHours(now.getHours() - 24);
      break;
  }

  return modelStore.modelHistoryData.filter(
    (entry) => new Date(entry.timestamp) >= timeThreshold
  );
});

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;

  chartInstance = echarts.init(chartRef.value);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: (params: any) => {
        let result = `<div style="margin-bottom: 10px;">${params[0].axisValue}</div>`;
        params.forEach((item: any) => {
          result += `
            <div style="display: flex; align-items: center; margin: 5px 0;">
              <span style="display: inline-block; width: 10px; height: 10px; background: ${item.color}; margin-right: 5px;"></span>
              <span style="flex: 1;">${item.seriesName}: </span>
              <span style="font-weight: bold;">${item.value}</span>
            </div>
          `;
        });
        return result;
      }
    },
    legend: {
      data: [] as string[],
      type: 'scroll',
      bottom: 60,
      padding: [5, 50]
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '20%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: [] as string[],
      axisLabel: {
        formatter: (value: string) => {
          const date = new Date(value);
          return `${date.getHours()}:${date
            .getMinutes()
            .toString()
            .padStart(2, '0')}`;
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '调用次数'
    },
    series: [] as any[],
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        bottom: 20
      },
      {
        start: 0,
        end: 100,
        bottom: 20,
        height: 30
      }
    ]
  };

  chartInstance.setOption(option);
};

// 更新图表数据
const updateChart = () => {
  if (!chartInstance || filteredData.value.length === 0) return;

  // 获取所有时间点
  const timestamps = filteredData.value.map((entry) => entry.timestamp);

  // 获取当前选中的模型（如果没选则显示全部）
  const modelsToShow =
    selectedModels.value.length > 0 ? selectedModels.value : allModels.value;

  // 准备系列数据
  const series = modelsToShow.map((modelName) => {
    return {
      name: modelName,
      type: 'line',
      data: filteredData.value.map((entry) => entry.data[modelName] || 0),
      smooth: true,
      showSymbol: false,
      lineStyle: {
        width: 2
      },
      areaStyle: {
        opacity: 0.1
      },
      emphasis: {
        focus: 'series'
      }
    };
  });

  const option = {
    xAxis: {
      data: timestamps
    },
    legend: {
      data: modelsToShow
    },
    series: series
  };

  chartInstance.setOption(option);
};

// 监听数据变化
watch(
  [() => modelStore.modelHistoryData, selectedModels, timeRange],
  () => {
    updateChart();
  },
  { deep: true }
);

onMounted(() => {
  initChart();

  modelStore
    .startGetModelTimes()
    .then(() => {
      modelStore.setupWatchers();
    })
    .catch((err) => {
      ElMessage.error('启动模型监控失败: ' + err.message);
    });

  // 窗口大小变化时重新调整图表大小
  window.addEventListener('resize', () => {
    chartInstance?.resize();
  });
});

onUnmounted(() => {
  modelStore.stopGetModelTimes();
  chartInstance?.dispose();
  window.removeEventListener('resize', () => {
    chartInstance?.resize();
  });
});
</script>

<style scoped>
.model-used-container {
  background-color: var(--admin-bg-color);
  color: var(--admin-text-color);
  border-radius: 4px;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  width: 100%;
  margin-top: 20px;
}

.controls {
  display: flex;
  align-items: center;
}
</style>
