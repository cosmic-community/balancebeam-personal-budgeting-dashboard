export default function Features() {
  const features = [
    {
      icon: '📊',
      title: 'Visual Dashboard',
      description: 'See your financial health at a glance with beautiful charts and intuitive visualizations.'
    },
    {
      icon: '💰',
      title: 'Transaction Tracking',
      description: 'Log income and expenses easily. Categorize and search through your financial history.'
    },
    {
      icon: '🎯',
      title: 'Category Management',
      description: 'Organize your finances with custom categories. Track spending patterns and optimize your budget.'
    },
    {
      icon: '🌙',
      title: 'Dark Mode',
      description: 'Switch between light and dark themes for comfortable viewing any time of day.'
    },
    {
      icon: '📱',
      title: 'Responsive Design',
      description: 'Access your financial dashboard on any device - desktop, tablet, or mobile.'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and secure. Built with privacy and security in mind.'
    }
  ]

  return (
    <section className="py-20 px-4 bg-surface-light dark:bg-surface-dark">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary-light dark:text-text-primary-dark mb-4">
            Everything You Need to Budget Better
          </h2>
          <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark max-w-2xl mx-auto">
            Powerful features designed to make personal finance management simple, intuitive, and effective.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card p-6">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                {feature.title}
              </h3>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}