#!/usr/bin/perl

use strict;
use warnings;

use CGI;
use CGI::Carp 'fatalsToBrowser';
use DBI;
use Data::Dumper;

my $cgi = CGI->new;
my $username = $cgi->param("username");
my $userpassword = $cgi->param("password");
my $json;

print "Content-Type: text/html\n\n";

my $dbh = DBI->connect("DBI:mysql:database=todolist;host=localhost;port=3306",  
  "user", "password") 
  or die $DBI::errstr;

my $statement = qq{SELECT id, password FROM users WHERE username=?};
my $sth = $dbh->prepare($statement)
  or die $dbh->errstr;
$sth->execute($username)
  or die $sth->errstr;
my ($userID, $password) = $sth->fetchrow_array;

if (!$userID) {
	$statement = qq{INSERT INTO users (username, password) VALUES (?, ?)};
	$sth = $dbh->prepare($statement) or die $dbh->errstr;

	$sth->execute($username, $userpassword) or die $sth->errstr;
	$userID = $dbh->{mysql_insertid};
	$json = ($userID) ? 
  		qq{{"success" : "login is successful", "userId" : "$userID"}} : 
  		qq{{"error" : "db problems, please try once more"}};
}
elsif ($userpassword ne $password) {
	$json = qq{{"error" : "wrong password or choose another name"}};
}
else {
	$json = qq{{"success" : "login is successful", "userId" : "$userID"}};
}

print $cgi->header(-type => "application/json", -charset => "utf-8");
print $json;