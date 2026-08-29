import {
  Gauge,
  HStack,
  ProgressView,
  Spacer,
  Text,
  VStack,
  ZStack,
} from '@expo/ui/swift-ui';
import {
  containerBackground,
  font,
  foregroundStyle,
  frame,
  gaugeStyle,
  lineLimit,
  minimumScaleFactor,
  padding,
  progressViewStyle,
  tint,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export type MaklaCalorieWidgetProps = {
  eaten: number;
  target: number;
  protein: number;
  carbs: number;
  fat: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  remainingLabel: string;
  proteinLabel: string;
  carbsLabel: string;
  fatLabel: string;
};

function MaklaCalorieWidget(
  props: MaklaCalorieWidgetProps,
  environment: WidgetEnvironment,
): React.JSX.Element {
  'widget';

  const ink = '#15121C';
  const green = '#4AB38A';
  const tomato = '#DE575F';
  const gold = '#E8924A';
  const sky = '#5A8FDC';
  const target = Math.max(1, props.target);
  const progress = Math.max(0, Math.min(1, props.eaten / target));
  const remaining = Math.max(0, Math.round(props.target - props.eaten));

  const ring = (size: number, valueSize: number) => (
    <ZStack modifiers={[frame({ width: size, height: size })]}>
      <Gauge
        value={progress}
        modifiers={[
          gaugeStyle('circularCapacity'),
          tint(green),
          frame({ width: size, height: size }),
        ]}
      />
      <VStack spacing={0}>
        <Text
          modifiers={[
            font({ size: valueSize, weight: 'black', design: 'rounded' }),
            foregroundStyle(ink),
            minimumScaleFactor(0.55),
            lineLimit(1),
          ]}
        >
          {remaining}
        </Text>
        {environment.widgetFamily !== 'accessoryCircular' ? (
          <Text
            modifiers={[
              font({ size: 8, weight: 'semibold' }),
              foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
              lineLimit(1),
            ]}
          >
            {props.remainingLabel}
          </Text>
        ) : null}
      </VStack>
    </ZStack>
  );

  const macroRow = (label: string, value: number, goal: number, color: string) => (
    <VStack alignment="leading" spacing={3}>
      <HStack spacing={4}>
        <Text modifiers={[font({ size: 10, weight: 'bold' }), foregroundStyle(ink)]}>
          {label}
        </Text>
        <Spacer />
        <Text
          modifiers={[
            font({ size: 10, weight: 'semibold' }),
            foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
            minimumScaleFactor(0.7),
            lineLimit(1),
          ]}
        >
          {Math.round(value)}/{Math.round(goal)}g
        </Text>
      </HStack>
      <ProgressView
        value={goal > 0 ? Math.max(0, Math.min(1, value / goal)) : 0}
        modifiers={[progressViewStyle('linear'), tint(color), frame({ height: 5 })]}
      />
    </VStack>
  );

  if (environment.widgetFamily === 'accessoryCircular') {
    return (
      <ZStack modifiers={[containerBackground('#00000000', 'widget')]}>
        {ring(54, 14)}
      </ZStack>
    );
  }

  if (environment.widgetFamily === 'systemMedium') {
    return (
      <HStack
        spacing={16}
        modifiers={[padding({ all: 12 }), containerBackground('#FFFFFF', 'widget')]}
      >
        {ring(92, 21)}
        <VStack spacing={9} modifiers={[frame({ maxWidth: 220 })]}>
          {macroRow(props.proteinLabel, props.protein, props.targetProtein, tomato)}
          {macroRow(props.carbsLabel, props.carbs, props.targetCarbs, gold)}
          {macroRow(props.fatLabel, props.fat, props.targetFat, sky)}
        </VStack>
      </HStack>
    );
  }

  return (
    <VStack
      spacing={6}
      modifiers={[padding({ all: 12 }), containerBackground('#FFFFFF', 'widget')]}
    >
      {ring(100, 22)}
      <Text
        modifiers={[
          font({ size: 10, weight: 'bold' }),
          foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
          minimumScaleFactor(0.7),
          lineLimit(1),
        ]}
      >
        {Math.round(props.eaten)} / {Math.round(props.target)} kcal
      </Text>
    </VStack>
  );
}

export default createWidget('MaklaCalorieWidget', MaklaCalorieWidget);
