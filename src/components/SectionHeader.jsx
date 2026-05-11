

const SectionHeader = ({ id, title, icon: Icon, color = 'indigo' }) => (
  <div id={id} className="flex items-center gap-3 mb-6 scroll-mt-24">
    <div className={`p-2 bg-${color}-500/10 rounded-lg`}>
      <Icon size={20} className={`text-${color}-400`} />
    </div>
    <h2 className="text-xl font-bold text-white uppercase tracking-tight">{title}</h2>
  </div>
);

export default SectionHeader;
