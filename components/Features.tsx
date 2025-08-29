export default function Features() {
  const features = [
    {
      icon: '📊',
      title: 'Interactive Dashboard',
      description: 'Beautiful charts and visualizations to understand your financial patterns at a glance.'
    },
    {
      icon: '💰',
      title: 'Transaction Tracking',
      description: 'Easily add, edit, and categorize your income and expenses with our intuitive interface.'
    },
    {
      icon: '🏷️',
      title: 'Smart Categories',
      description: 'Organize your finances with custom categories and color-coded organization.'
    },
    {
      icon: '📱',
      title: 'Mobile Ready',
      description: 'Access your finances anywhere with our responsive design that works on all devices.'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and secure with industry-standard protection.'
    },
    {
      icon: '🌙',
      title: 'Dark Mode',
      description: 'Switch between light and dark themes for comfortable viewing any time of day.'
    }
  ]

  return (
    <section className="py-20 px-4 bg-card-light dark:bg-card-dark">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark mb-4">
            Everything you need to manage your money
          </h2>
          <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark max-w-2xl mx-auto">
            Powerful features designed to make financial management simple, intuitive, and insightful.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="card hover:shadow-lg transition-shadow duration-200"
            >
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