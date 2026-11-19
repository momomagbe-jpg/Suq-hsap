import type { AppDataState, LedgerContact } from '../types';
import { getOffsetDateISO } from '../utils/formatters';

interface SeedContactSpec {
  id: string;
  kind: 'customers' | 'suppliers';
  name: string;
  amount: number;
  direction: 'given' | 'taken';
  daysAgo: number;
  phone?: string;
  note?: string;
}

const CUSTOMER_SEEDS: SeedContactSpec[] = [
  { id: 'c_1', kind: 'customers', name: 'محمد سعيد', amount: 700, direction: 'given', daysAgo: 201, phone: '01011223344', note: 'بضاعة متنوعة آجل' },
  { id: 'c_2', kind: 'customers', name: 'هند شاي', amount: 150, direction: 'given', daysAgo: 200, phone: '01122334455', note: 'باقي فاتورة طلبية' },
  { id: 'c_3', kind: 'customers', name: 'العوامي', amount: 100, direction: 'given', daysAgo: 181, note: 'حساب مفتوح' },
  { id: 'c_4', kind: 'customers', name: 'شعبان', amount: 1300, direction: 'given', daysAgo: 181, phone: '01233445566', note: 'توريد بضاعة موسمية' },
  { id: 'c_5', kind: 'customers', name: 'بسمله', amount: 1150, direction: 'given', daysAgo: 137, phone: '01099887766', note: 'رصيد متبقي من الفاتورة' },
  { id: 'c_6', kind: 'customers', name: 'العناني', amount: 1880, direction: 'given', daysAgo: 124, phone: '01555443322', note: 'تجهيزات محل' },
  { id: 'c_7', kind: 'customers', name: 'مصطفى الشناوي', amount: 950, direction: 'given', daysAgo: 118 },
  { id: 'c_8', kind: 'customers', name: 'الحاج إبراهيم', amount: 1420, direction: 'given', daysAgo: 112 },
  { id: 'c_9', kind: 'customers', name: 'أميرة حسن', amount: 480, direction: 'given', daysAgo: 105 },
  { id: 'c_10', kind: 'customers', name: 'خالد عبد الله', amount: 860, direction: 'given', daysAgo: 98 },
  { id: 'c_11', kind: 'customers', name: 'ورشة السلام', amount: 1650, direction: 'given', daysAgo: 92 },
  { id: 'c_12', kind: 'customers', name: 'طارق المنسي', amount: 520, direction: 'given', daysAgo: 88 },
  { id: 'c_13', kind: 'customers', name: 'سماح محمود', amount: 340, direction: 'given', daysAgo: 84 },
  { id: 'c_14', kind: 'customers', name: 'علاء الدين', amount: 1100, direction: 'given', daysAgo: 79 },
  { id: 'c_15', kind: 'customers', name: 'مينا جرجس', amount: 740, direction: 'given', daysAgo: 75 },
  { id: 'c_16', kind: 'customers', name: 'حسام البدري', amount: 620, direction: 'given', daysAgo: 70 },
  { id: 'c_17', kind: 'customers', name: 'نجلاء فتحي', amount: 290, direction: 'given', daysAgo: 66 },
  { id: 'c_18', kind: 'customers', name: 'محمود الغندور', amount: 1250, direction: 'given', daysAgo: 61 },
  { id: 'c_19', kind: 'customers', name: 'ياسر عرفات', amount: 430, direction: 'given', daysAgo: 58 },
  { id: 'c_20', kind: 'customers', name: 'داليا صلاح', amount: 510, direction: 'given', daysAgo: 54 },
  { id: 'c_21', kind: 'customers', name: 'عادل أبو علي', amount: 890, direction: 'given', daysAgo: 49 },
  { id: 'c_22', kind: 'customers', name: 'مكتبة الأندلس', amount: 1400, direction: 'given', daysAgo: 45 },
  { id: 'c_23', kind: 'customers', name: 'فؤاد المهندس', amount: 670, direction: 'given', daysAgo: 42 },
  { id: 'c_24', kind: 'customers', name: 'كريم السعيد', amount: 380, direction: 'given', daysAgo: 38 },
  { id: 'c_25', kind: 'customers', name: 'نادية لطفي', amount: 260, direction: 'given', daysAgo: 35 },
  { id: 'c_26', kind: 'customers', name: 'أشرف عبد الباقي', amount: 910, direction: 'given', daysAgo: 31 },
  { id: 'c_27', kind: 'customers', name: 'وليد سليمان', amount: 775, direction: 'given', daysAgo: 28 },
  { id: 'c_28', kind: 'customers', name: 'مروان محسن', amount: 540, direction: 'given', daysAgo: 24 },
  { id: 'c_29', kind: 'customers', name: 'سلوى خطاب', amount: 320, direction: 'given', daysAgo: 21 },
  { id: 'c_30', kind: 'customers', name: 'هاني رمزي', amount: 690, direction: 'given', daysAgo: 18 },
  { id: 'c_31', kind: 'customers', name: 'تامر السيوفي', amount: 830, direction: 'given', daysAgo: 15 },
  { id: 'c_32', kind: 'customers', name: 'عبير صبري', amount: 410, direction: 'given', daysAgo: 12 },
  { id: 'c_33', kind: 'customers', name: 'جمال سليمان', amount: 990, direction: 'given', daysAgo: 10 },
  { id: 'c_34', kind: 'customers', name: 'أيمن زيدان', amount: 600, direction: 'given', daysAgo: 8 },
  { id: 'c_35', kind: 'customers', name: 'حنان ترك', amount: 350, direction: 'given', daysAgo: 6 },
  { id: 'c_36', kind: 'customers', name: 'صبري فواز', amount: 720, direction: 'given', daysAgo: 5 },
  { id: 'c_37', kind: 'customers', name: 'ماجد الكدواني', amount: 880, direction: 'given', daysAgo: 4 },
  { id: 'c_38', kind: 'customers', name: 'إسعاد يونس', amount: 650, direction: 'given', daysAgo: 2 },
  { id: 'c_39', kind: 'customers', name: 'يوسف الشريف', amount: 1210, direction: 'given', daysAgo: 1 },
  // 1 customer where we owe/took 100.0 (أخذت)
  { id: 'c_40', kind: 'customers', name: 'أبو مازن للحلويات', amount: 100, direction: 'taken', daysAgo: 14, note: 'عربون محصل مقدماً' },
];

const SUPPLIER_SEEDS: SeedContactSpec[] = [
  { id: 's_1', kind: 'suppliers', name: 'شركة النور للتجارة والتوزيع', amount: 4850, direction: 'taken', daysAgo: 22, phone: '01022334411', note: 'باقي فاتورة توريد رقم 408' },
  { id: 's_2', kind: 'suppliers', name: 'مؤسسة الفجر للمواد الغذائية', amount: 3200, direction: 'taken', daysAgo: 15, phone: '01144556622', note: 'دفعة آجلة تستحق آخر الشهر' },
  { id: 's_3', kind: 'suppliers', name: 'الحرمين للتغليف والكراتين', amount: 950, direction: 'given', daysAgo: 9, phone: '01277889900', note: 'دفعة مقدمة تحت الحساب' },
  { id: 's_4', kind: 'suppliers', name: 'أولاد رجب للجملة', amount: 1750, direction: 'taken', daysAgo: 6, note: 'بضاعة مخزن أ' },
  { id: 's_5', kind: 'suppliers', name: 'شركة الدلتا للاستيراد', amount: 2400, direction: 'taken', daysAgo: 3, note: 'توريد أجهزة وإكسسوارات' },
  { id: 's_6', kind: 'suppliers', name: 'مخزن البركة', amount: 600, direction: 'given', daysAgo: 1, note: 'مرتجع بضاعة مسجل لصالحنا' },
];

function buildContact(spec: SeedContactSpec): LedgerContact {
  const dateStr = getOffsetDateISO(-spec.daysAgo);
  return {
    id: spec.id,
    kind: spec.kind,
    name: spec.name,
    phone: spec.phone,
    lastDate: dateStr,
    transactions: [
      {
        id: `t_${spec.id}_1`,
        date: dateStr,
        direction: spec.direction,
        amount: spec.amount,
        note: spec.note ?? (spec.direction === 'given' ? 'رصيد مسجل له علينا / أعطيت' : 'رصيد مسجل أخذت'),
      },
    ],
  };
}

export function createInitialAppData(): AppDataState {
  const today = getOffsetDateISO(0);
  const yesterday = getOffsetDateISO(-1);
  const twoDaysAgo = getOffsetDateISO(-2);
  const fourDaysAgo = getOffsetDateISO(-4);

  return {
    activeLedgerId: 'ledger_main',
    privacyMasked: false,
    ledgers: [
      {
        id: 'ledger_main',
        title: 'خزنة البركة',
        currency: 'ج.م',
        contacts: [
          ...CUSTOMER_SEEDS.map(buildContact),
          ...SUPPLIER_SEEDS.map(buildContact),
        ],
        cashbook: [
          {
            id: 'cb_1',
            date: today,
            direction: 'in',
            amount: 2450,
            category: 'مبيعات نقدية',
            note: 'إجمالي مبيعات الكاش اليومية',
          },
          {
            id: 'cb_2',
            date: today,
            direction: 'out',
            amount: 320,
            category: 'شحن وتوصيل',
            note: 'أجرة مندوب توصيل الطلبات',
          },
          {
            id: 'cb_3',
            date: yesterday,
            direction: 'in',
            amount: 1800,
            category: 'تحصيل دين',
            note: 'تحصيل جزء من حساب العملاء',
          },
          {
            id: 'cb_4',
            date: twoDaysAgo,
            direction: 'out',
            amount: 650,
            category: 'مصاريف تشغيل',
            note: 'فاتورة كهرباء وإنترنت المحل',
          },
          {
            id: 'cb_5',
            date: fourDaysAgo,
            direction: 'in',
            amount: 3100,
            category: 'مبيعات نقدية',
            note: 'إقفال وردية المساء',
          },
        ],
      },
      {
        id: 'ledger_branch2',
        title: 'خزنة المخزن الفرعي',
        currency: 'ج.م',
        contacts: [
          buildContact({
            id: 'b2_c1',
            kind: 'customers',
            name: 'محل الأمل',
            amount: 1600,
            direction: 'given',
            daysAgo: 12,
            note: 'طلبية جملة',
          }),
          buildContact({
            id: 'b2_s1',
            kind: 'suppliers',
            name: 'مورد الصفوة',
            amount: 2100,
            direction: 'taken',
            daysAgo: 8,
            note: 'فاتورة بضاعة',
          }),
        ],
        cashbook: [
          {
            id: 'b2_cb1',
            date: today,
            direction: 'in',
            amount: 1200,
            category: 'مبيعات نقدية',
            note: 'مبيعات الفرع',
          },
        ],
      },
    ],
  };
}
