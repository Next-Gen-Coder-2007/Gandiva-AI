import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Mail, ArrowRight, CheckCircle2, Loader2, MapPin, Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { sendContactMessage } from '../../services/contact';

interface FormData {
  name: string;
  email: string;
  message: string;
}

type Status = 'idle' | 'submitting' | 'success';

const Contact = () => {
  const { isDark } = useTheme();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });

  const [status, setStatus] = useState<Status>('idle');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      await sendContactMessage(
        formData.name,
        formData.email,
        formData.message
      )

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 3000);

    } catch (error: any) {
      setStatus('idle');
      alert(error.response.data.detail);
    }
  };

  const inputBaseClasses = `w-full px-4 py-3 text-sm rounded-lg border transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-1 ${
    isDark
      ? 'bg-black border-white/20 text-white placeholder:text-white/40 focus:border-green-500 focus:ring-green-500/20 focus:ring-offset-black'
      : 'bg-white border-black/20 text-black placeholder:text-black/40 focus:border-green-500 focus:ring-green-500/20 focus:ring-offset-white'
  }`;

  return (
    <section id='contact' className={`py-20 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300 min-h-screen flex flex-col justify-center ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      <div className="max-w-5xl mx-auto w-full">
        
        <div className="max-w-3xl mb-10 text-center mx-auto">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            Let's build <span className="text-green-500">something great.</span>
          </h2>
          <p className={`text-base md:text-lg leading-relaxed ${isDark ? 'text-white/60' : 'text-black/60'}`}>
            Whether you have a question about our platform, need enterprise pricing, or just want to say hi, our team is ready to answer all your questions.
          </p>
        </div>

        <div className={`rounded-2xl border overflow-hidden shadow-2xl ${
          isDark 
            ? 'border-white/10 shadow-black' 
            : 'border-black/10 shadow-black/5'
        }`}>
          <div className="grid grid-cols-1 lg:grid-cols-5">
            
            {/* Contact Information Sidebar */}
            <div className={`p-8 lg:p-12 lg:col-span-2 border-b lg:border-b-0 lg:border-r flex flex-col justify-center ${
              isDark ? 'border-white/10 bg-black' : 'border-black/10 bg-white'
            }`}>
              <h3 className="text-xl md:text-2xl font-semibold mb-8">Contact Info</h3>
              
              <div className="space-y-8">
                {/* Email Block */}
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-600'}`}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium mb-1 ${isDark ? 'text-white/60' : 'text-black/60'}`}>Email Us</p>
                    <a href="mailto:hello@platform.com" className="text-base font-medium hover:text-green-500 transition-colors break-all">
                      hello@platform.com
                    </a>
                  </div>
                </div>

                {/* HQ Block */}
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-600'}`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium mb-1 ${isDark ? 'text-white/60' : 'text-black/60'}`}>Headquarters</p>
                    <p className="text-base font-medium leading-tight">
                      123 Innovation Drive, SF 94105
                    </p>
                  </div>
                </div>

                {/* Response Time Block */}
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-600'}`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium mb-1 ${isDark ? 'text-white/60' : 'text-black/60'}`}>Response Time</p>
                    <p className="text-base font-medium">Within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className={`p-8 lg:p-12 lg:col-span-3 ${isDark ? 'bg-black' : 'bg-white'}`}>
              <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto lg:mx-0 lg:max-w-none">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="name" className={`text-sm font-medium ${isDark ? 'text-white/90' : 'text-black/90'}`}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Jane Doe"
                      className={inputBaseClasses}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className={`text-sm font-medium ${isDark ? 'text-white/90' : 'text-black/90'}`}>
                      Work Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="jane@company.com"
                      className={inputBaseClasses}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className={`text-sm font-medium ${isDark ? 'text-white/90' : 'text-black/90'}`}>
                    How can we help?
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Tell us a little about your project..."
                    className={`${inputBaseClasses} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className={`w-full py-3 rounded-lg text-white font-medium text-base flex items-center justify-center gap-2 transition-all duration-300 shadow-sm mt-2
                    ${status === 'success'
                      ? 'bg-green-500 shadow-green-500/20 cursor-default'
                      : 'bg-green-600 hover:bg-green-500 hover:-translate-y-0.5 disabled:opacity-70 shadow-green-900/20'
                    }`}
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                    </>
                  ) : status === 'success' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" /> Message Sent
                    </>
                  ) : (
                    <>
                      Send Message <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                
                <p className={`text-xs text-center mt-3 ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                  By submitting this form, you agree to our privacy policy.
                </p>
              </form>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;