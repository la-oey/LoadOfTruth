source('cleanData.R') # reading in file that cleans data and outputs stuff

sender <- df %>%
  filter(role == "sender")
write_csv(sender, "sender.csv")

receiver <- df %>%
  filter(role == "receiver")
write_csv(receiver, "receiver.csv")

glimpse(df)


# subjects per condition
sender %>% 
  distinct(condition, subjID) %>%
  count(condition)

# calculate proportion of lying
sender %>%
  group_by(condition) %>%
  summarise(propLie = sum(k != ksay)/n()) # # times participant lied divided by total # opportunities per condition

# dot plot of lying rate
sender %>%
  group_by(condition, subjID) %>%
  summarise(propLie = sum(k != ksay)/n()) %>% # what we did above but per subject
  ggplot(aes(x=condition, y=propLie, fill=condition)) +
  geom_dotplot(binaxis = "y", stackdir = "center", alpha=0.4) +
  stat_summary(shape=23) +
  theme_bw()
ggsave("img/lie_rate.png")

# tile plot of what was reported vs what was true
sender %>%
  count(condition, k, ksay) %>% # gets counts of instances of each condition, k, and ksay 
  complete(condition=unique(sender$condition), # fills in when there are 0 instances (~creates 2 matrices)
           k=0:10, 
           ksay=0:10, 
           fill = list(n = 0)) %>%
  group_by(condition, k) %>%
  mutate(prop = n/sum(n)) %>% # calculates proportion of times ksay is said for a given k
  ggplot(aes(x=k, y=ksay, fill=prop)) +
  geom_tile() +
  scale_x_continuous(expand=c(0,0)) +
  scale_y_continuous(expand=c(0,0)) +
  scale_fill_gradient2(low="white", mid="darkorchid", high="blue", midpoint=0.5, 
                       limits=c(0,1), labels=c("0%","25%","50%","75%","100%")) +
  facet_wrap(~condition)

s.summ <- sender %>%
  filter(k != ksay) %>%
  group_by(condition) %>%
  summarise(meanLie = mean(ksay),
            seLie = sd(ksay)/n())

# dotplot of mean lies
sender %>%
  filter(k != ksay) %>% # look at lies
  group_by(condition, subjID) %>%
  summarise(meanLie = mean(ksay)) %>%
  ggplot(aes(x=condition, y=meanLie, fill=condition)) +
  geom_dotplot(binaxis = "y", stackdir = "center", alpha=0.4) +
  geom_pointrange(data=s.summ, 
                  aes(x=condition, y=meanLie, ymin=meanLie-seLie, ymax=meanLie+seLie),
                  shape=23) +
  scale_y_continuous(limits=c(2,8)) +
  theme_bw()
ggsave("img/mean_lie.png")



sender %>%
  ggplot(aes(x=k, y=ksay)) +
  geom_jitter()



sender %>%
  filter(trialNumber %in% c(1,2)) %>%
  ggplot(aes(x=reportedRoll)) +
  geom_bar(colour="black", fill="white", width=0.8) +
  scale_x_continuous(breaks=0:10) +
  scale_y_continuous(expand=c(0,0,0,3)) +
  ggtitle("Roll Counts") +
  theme(panel.grid.major.x = element_blank(),
        panel.grid.minor.x = element_blank())

sender %>%
  ggplot(aes(x=reportedRoll)) +
  geom_bar() +
  ggtitle("Roll Counts")

sender %>%
  gather("type","roll",6:7) %>%
  select(subjID, type, roll) %>%
  ggplot(aes(x=roll, fill=type, colour=type)) +
  geom_bar(alpha=0.5, position="identity") +
  scale_x_continuous(breaks = c(0:10))

sender %>%
  mutate(truth = trueRoll == reportedRoll) %>%
  #group_by(trueRoll, reportedRoll, truth) %>%
  #summarise(n = n()) %>%
  #arrange(desc(n))
  ggplot(aes(x=reportedRoll, fill=truth)) +
  geom_bar() +
  scale_x_continuous("reported roll", expand=c(0,0), breaks=seq(0,10,2)) +
  scale_y_continuous(breaks=seq(0,300,200)) +
  scale_fill_manual(values=c("red","forestgreen")) +
  coord_flip() +
  guides(fill=F) +
  facet_wrap(~trueRoll, ncol=11) +
  theme_bw()
ggsave("img/true_vs_reported_bar.png", width=7, height=2.5)

sender %>%
  count(trueRoll, reportedRoll) %>%
  complete(trueRoll=0:10, reportedRoll=0:10, fill = list(n = 0)) %>%
  group_by(trueRoll) %>%
  mutate(prop = n/sum(n)) %>%
  ggplot(aes(x=trueRoll, y=reportedRoll, fill=prop)) +
  geom_tile() +
  scale_x_continuous("true roll", expand=c(0,0), breaks=seq(0,10,2)) +
  scale_y_continuous("reported roll", expand=c(0,0), breaks=seq(0,10,2)) +
  scale_fill_gradient2(low="white", mid="darkorchid", high="blue", midpoint=0.5, limits=c(0,1))
ggsave("img/true_vs_reported_tile.png")




# computer's behavior

df %>%
  filter(roleCurrent == "bullshitter") %>%
  group_by(reportedRoll) %>%
  summarise(computerCallBS = sum(callBS)/n()) %>%
  ggplot(aes(x=reportedRoll, y=computerCallBS)) +
  geom_point() +
  geom_line()



