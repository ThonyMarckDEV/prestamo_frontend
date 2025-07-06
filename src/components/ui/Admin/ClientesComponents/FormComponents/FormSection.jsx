const FormSection = ({ title, children }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center mb-4">
        <div className="w-2 h-8 bg-red-600 mr-3 rounded" />
        <h3 className="text-lg font-medium text-red-700">{title}</h3>
      </div>
      {children}
    </div>
  );
};

export default FormSection;